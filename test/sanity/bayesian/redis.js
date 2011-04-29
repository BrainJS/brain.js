var assert = require('assert'),
    brain = require("../../../lib/brain");

var spam = ["vicodin pharmacy",
            "all quality replica watches marked down",
            "cheap replica watches",
            "receive more traffic by gaining a higher ranking in search engines",
            "viagra pills",
            "watches chanel tag heuer",
            "watches at low prices"];

var not = ["unknown command line parameters",
           "I don't know if this works on Windows",
           "recently made changed to terms of service agreement",
           "does anyone know about this",
           "this is a bit out of date",
           "the startup options need linbayesking"]

var data = [];
spam.forEach(function(text) {
  data.push({input: text, output: 'spam'});
});
not.forEach(function(text) {
  data.push({input: text, output: 'notspam'});
});

var bayes = new brain.BayesianClassifier({
  backend : {type: 'Redis'}
});

bayes.trainAll(data, function() {
  bayes.classify("replica watches", function(cat) {
    assert.equal(cat, "spam");
  });

  bayes.classify("check out the docs", function(cat) {
    assert.equal(cat, "notspam")
  });

  bayes.classify("recently, I've been thinking that we should", function(cat) {
    assert.equal(cat, "notspam")
  });

  bayes.classify("come buy these cheap pills", function(cat) {
    assert.equal(cat, "spam")
  });
});

assert.doesNotThrow(function() {
    bayes.train("cheap cialis", "spam");
}, function (err) {}, "train should not require a callback.");
