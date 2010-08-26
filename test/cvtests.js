require("underscore");

var sys = require("sys"),
    fs = require("fs"),
    path = require("path"),
    url = require("url"),
    cradle = require("cradle"),
    brain = require("../lib/brain"),
    nomnom = require("nomnom");


function crossValidate(type, options, data, slices) {
  if(type == "neuralnetwork")
    constructor = brain.NeuralNetwork;
  return brain.crossValidate(constructor, options, data, slices);
}

function getData(couchUrl, callback) {
  var parts = url.parse(couchUrl);
  var client = new cradle.Connection(parts.host, parts.port || 80);
  var db = client.database(parts.pathname);
  db.all({include_docs: true}, function(err, res) {
    if(err)
      sys.puts("error retreiving data from " + couchUrl + ": '" + err + "'");
    else {
      var data = _(res.rows).pluck("doc")
      callback(data);
    }
  });
}

function runTest(config) {
  var type = config.type || "neuralnetwork";
  var options = config.options || {};
  var slices = config.slices || 3;
  
  getData(config.db, function(data) {
    sys.puts("running " + type + " test on data size: " + data.length)
    var stats = crossValidate(type, options, data, slices);
    sys.puts(JSON.stringify(stats))
  })
}

var opts = [
  { name: 'config',
    string: '--config=FILE',
    default: path.join(__dirname, "cvtests.json"),
    help: 'JSON manifest of cross-validation tests to run'
  },
  {
    string: '--db=URL',
    help: 'url to CouchDB database of training data'
  },
  {
    string: '--options=JSON',
    help: 'options to pass to classifier'
  }
];

var options = nomnom.parseArgs(opts, {script: 'node cvtests.js'});

var tests;
if(options.db) {
  tests = [options];
}
else {
  tests = JSON.parse(fs.readFileSync(options.config, "utf-8"));
}

_(tests).map(function(testConfig) {
  runTest(testConfig);
});