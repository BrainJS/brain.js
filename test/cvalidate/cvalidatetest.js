var sys = require("sys"),
    fs = require("fs"),
    path = require("path"),
    url = require("url"),
    cradle = require("cradle"),
    nomnom = require("nomnom"),
    colors = require("colors"),
    _ = require("underscore")._,
    brain = require("../../lib/brain");

exports.runTests = function(options) {
  var tests;
  if(options.db) {
    tests = [options];
  }
  else {
    var config = JSON.parse(fs.readFileSync(options.config, "utf-8"));
    if(options.type)
      tests = _(config[options.type]).map(function(test) {
        test.type = options.type;
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
    runTest(testConfig, options);
  });
}

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
  if(type == "neuralnet")
    constructor = brain.NeuralNetwork;
  else if(type == "bayes")
    constructor = brain.BayesianClassifier;
  
  return brain.crossValidate(constructor, options, data, slices);
}

function runTest(config, options) {
  var type = config.type || "neuralnet";
  var opts = config.options || {};
  var slices = config.slices || 3;
  
  getDocs(config.db, function(data) {
    sys.puts("\nrunning " + type + " test on data size: " + data.length)
    var stats = crossValidate(type, opts, data, slices);

    var err = 0, train = 0, test = 0;
    var sums = stats.forEach(function(stat) {
      err += stat.error;
      train += stat.trainTime;
      test += stat.testTime;
    });
    var error = (err / stats.length);    
    var errormsg = "\naverage error: " + error.toFixed(2);
    if(error > .25)
      errormsg = errormsg.red;
    else
      errormsg = errormsg.green;
    sys.puts(errormsg);
    sys.puts("average train time: " + ((train / stats.length)).toFixed(0) + " ms");
    sys.puts("average test time: " + (test / stats.length).toFixed(0) + " ms");
    
    if(options.report) {
      var db = getDb(options.report);
      var report = {
        stats: stats,
        name: options.reportName,
        timestamp: new Date(),
        config: config
      }
      db.insert(report, function(err, res) {
        if(err)
          sys.puts("error sending report to " + option.report);
        else
          sys.puts("saved report " + options.report + "/" + res.id);
      }); 
    }
  });
}