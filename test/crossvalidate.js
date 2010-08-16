require("underscore");

var sys = require("sys"),
    fs = require("fs"),
    path = require("path"),
    url = require("url"),
    cradle = require("cradle"),
    brain = require("../lib/brain");

function testSet(type, trainingSet, testingSet) {
  var classifier;
  if(type == "neuralnetwork")
    classifier = new brain.NeuralNetwork();
  
  var t1 = Date.now();
  classifier.train(trainingSet);
  var t2 = Date.now();
  var error = classifier.test(testingSet);
  var t3 = Date.now();
  
  return {
    error : error,
    trainingTime : t2 - t1,
    testingTime : t3 - t2
  };
}

function crossValidate(type, data, slices) {
  var sliceSize = data.length / slices;
  var partitions = _.range(slices).map(function(i) {
    var dclone = _(data).clone();
    return [dclone.splice(i * sliceSize, sliceSize), dclone];
  });
  
  var results = _(partitions).map(function(partition, i) {
    sys.print("testing partition " + (i + 1) + " of " + slices + " ... ");
    var stats = testSet(type, partition[1], partition[0]);
    sys.print(" error: " + stats.error + "\n");
    return stats;
  });
  return results;
}

function getData(couchUrl, callback) {
  var parts = url.parse(couchUrl);
  var client = new cradle.Connection(parts.host, parts.port || 80);
  var db = client.database(parts.pathname);
  db.all({include_docs: true}, function(err, res) {
    if(err)
      sys.puts("error retreiving data from " + couchUrl + " " + error);
    else {
      var data = _(res.rows).pluck("doc")
      callback(data);
    }
  });
}

var couchUrl = "http://harth.couchone.com/blackorwhite";
getData(couchUrl, function(data) { crossValidate("neuralnetwork", data, 3);})