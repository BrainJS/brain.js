var url = require("url"),
    assert = require("should"),
    cradle = require("cradle"),
    _ = require("underscore"),
    brain = require("../../lib/brain"),
    crossValidate = require("../../lib/cross-validate");

function getData(couchUrl, callback) {
  var parts = url.parse(couchUrl);

  var client = new cradle.Connection(parts.hostname, parts.port || 80);
  var db = client.database(parts.pathname.replace(/^\//, ""));


  db.all({include_docs: true}, function(err, res) {
    if (err) {
      console.log("error getting data from " + url + ": ");
      console.log(err);
    }
    else {
      var data = _(res.rows).pluck("doc");
      callback(data);
    }
  });
}

function runTest(url, callback) {
  getData(url, function(data) {
    var result = crossValidate(brain.NeuralNetwork, {}, data);
    callback(result);
  });
}

describe('neural network cross-validation', function() {
  it('learn best text color for a background color', function(done) {
    var couchUrl = "http://harth.iriscouch.com/blackorwhite";

    runTest(couchUrl, function(result) {
      console.log("\nMisclassifications:");
      result.misclasses.forEach(function(misclass) {
        console.log("input: " + misclass.input
          + " actual: " + letters[misclass.actual]
          + " expected: " + letters[misclass.expected] + "\n")
      })

      console.log("Cross-validation of color contrast data:\n");
      console.log(result.avgs);

      console.log("\nMisclassification rate: "
      + result.misclasses.length / (result.avgs.testSize + result.avgs.trainSize));

      console.log("\nMean squared error: "
      + result.avgs.error);

      var perf = result.avgs.iterations / (result.avgs.trainTime / 1000);
      console.log("\nTraining iterations per second: " + perf);

      assert.ok(result.avgs.error < .02);
      done();
    })
  })
})
