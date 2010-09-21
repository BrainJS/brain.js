var sys = require("sys"),
    fs = require("fs"),
    path = require("path"),
    url = require("url"),
    cradle = require("cradle"),
    nomnom = require("nomnom"),
    _ = require("underscore")._,
    brain = require("../../lib/brain");

function getDb(couchUrl) {
  var parts = url.parse(couchUrl);
  var client = new cradle.Connection(parts.hostname, parts.port || 80);
  return client.database(parts.pathname);  
}

function getDocs(couchUrl, callback) {
  var db = getDb(couchUrl);
  db.all({include_docs: true}, function(err, res) {
    if(err)
      sys.puts("error retreiving data from " + couchUrl + ": '" + err + "'");
    else {
      var data = _(res.rows).pluck("doc")
      callback(data);
    }
  });
}

function crossValidate(type, options, data, slices) {
  var constructor;
  if(type == "neuralnetwork")
    constructor = brain.NeuralNetwork;
  else if(type == "bayesian")
    constructor = brain.BayesianClassifier;
  
  return brain.crossValidate(constructor, options, data, slices);
}

function runTest(config) {
  var type = config.type || "neuralnetwork";
  var opts = config.options || {};
  var slices = config.slices || 3;
  
  getDocs(config.db, function(data) {
    sys.puts("\nrunning " + type + " test on data size: " + data.length)
    var stats = crossValidate(type, opts, data, slices);
    if(options.verbose)
      sys.inspect(stats);

    var avg = _(stats).reduce(function(sum, stat) {
      return {err: sum.err + stat.error, time: sum.time + stat.trainTime};
    }, {err: 0, time: 0});
    sys.puts("\naverage error: " + (avg.err / stats.length));
    sys.puts("average train time: " + (avg.time / stats.length) / 1000 + " seconds");
    
    if(options.report) {
      var db = getDb(options.report);
      var report = {
        stats: stats,
        name: options.reportName,
        timestamp: new Date()
      }
      db.insert(report, function(err, res) {
        sys.puts("saved report" + JSON.stringify(res));
      }); 
    }
  });
}

var opts = [
  { name: 'target',
    position: 0
  },
  
  { name: 'config',
    string: '-c FILE',
    long: '--config=FILE',
    default: path.join(__dirname, "cvtests.json"),
    help: 'JSON manifest of cross-validation tests to run'
  },
  
  { string: '-d URL',
    long: '--db=URL',
    help: 'url to CouchDB database of training data'
  },
  
  { string: '-o JSON',
    long: '--options=JSON',
    help: 'options to pass to classifier'
  },

  { string: '-t [neuralnetwork|bayesian]',
    long: '--type=TYPE',
    help: 'type of classifier/network to test'
  },

  { name: 'verbose',
    string: '-v',
    long: '--verbose',
    help: 'print more messages'
  },
  
  { name: 'report',
    string: '-r COUCHDB',
    long: '--report=COUCHDB',
    help: 'couch db to post results to'
  },
  
  { name: 'reportName',
    string: '-n NAME',
    long: '--report-name=NAME',
    help: 'name of results report'
  },
];

var options = nomnom.parseArgs(opts, {script: 'node cvtests.js'});

var tests;
if(options.db) {
  tests = [options];
}
else {
  var config = JSON.parse(fs.readFileSync(options.config, "utf-8"));
  if(options.target)
    tests = _(config[options.target]).map(function(test) {
      test.type = options.target;
      return test;
    });
  else
    tests = _(config).reduce(function(allTests, tests, type) {
      tests = tests.map(function(test) {
        test.type = type;
        return test;
      });
      return allTests.concat(tests);
    }, []);
}

_(tests).map(function(testConfig) {
  runTest(testConfig);
});