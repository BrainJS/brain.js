var assert = require('assert'),
    brain = require("../../lib/brain"),
    sys = require("sys");

var spam = ["a c", "b a", "c e"];
var not = ["d e", "e f", "f b"];

var bayes = new brain.BayesianClassifier({ 
  thresholds: {
    spam: 3,
    notspam: 1
  }
});

spam.forEach(function(text) { bayes.train(text, 'spam'); });
not.forEach(function(text) { bayes.train(text, 'notspam'); });

assert.equal(bayes.classify("a"), "spam");
assert.equal(bayes.classify("b"), "notspam");
assert.equal(bayes.classify("c"), "spam");
assert.equal(bayes.classify("d"), "notspam");
assert.equal(bayes.classify("e"), "notspam");

bayes.setThresholds({spam: 4, notspam: 4});

assert.equal(bayes.classify("a"), "unclassified");
assert.equal(bayes.classify("b"), "unclassified");
assert.equal(bayes.classify("c"), "unclassified");
assert.equal(bayes.classify("d"), "unclassified");
assert.equal(bayes.classify("e"), "unclassified");
