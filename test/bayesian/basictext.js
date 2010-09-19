var assert = require('assert'),
    brain = require("../../lib/brain");

function testBasic(bayes) {
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
             "the startup options need linking"]

  spam.forEach(function(text) { bayes.train(text, 'spam'); });
  not.forEach(function(text) { bayes.train(text, 'notspam'); });

  assert.equal(bayes.classify("replica watches"),"spam");
  assert.equal(bayes.classify("check out the docs"), "notspam");
  assert.equal(bayes.classify("recently, I've been thinking that I should"), "notspam");
  assert.equal(bayes.classify("come buy these cheap pills"), "spam");
}

// test the synchronous backends
testBasic(new brain.BayesianClassifier());

testBasic(new brain.BayesianClassifier({
  backend : {
    type: 'localStorage',
    options: {
      name: 'testnamespace',
      testing: true 
    } 
  }
}));
