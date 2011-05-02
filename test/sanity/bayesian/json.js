var assert = require('assert'),
    brain = require("../../../lib/brain");

var expected = {"cats":{"spam":3,"notspam":2},"words":{"vicodin":{"spam":1},"pharmacy":{"spam":1},"on":{"spam":1,"notspam":1},"cheap":{"spam":1},"replica":{"spam":1},"watches":{"spam":1},"viagra":{"spam":1},"pills":{"spam":1},"unknown":{"notspam":1},"command":{"notspam":1},"line":{"notspam":1},"parameters":{"notspam":1},"I":{"notspam":1},"don":{"notspam":1},"t":{"notspam":1},"know":{"notspam":1},"if":{"notspam":1},"this":{"notspam":1},"works":{"notspam":1},"Windows":{"notspam":1}}};

function testTo(bayes, async) {
  var data = [{input: "vicodin pharmacy on", output: "spam"},
              {input: "cheap replica watches", output: "spam"},
              {input: "viagra pills", output: "spam"},
              {input: "unknown command line parameters", output: "notspam"},
              {input: "I don't know if this works on Windows", output: "notspam"}]

  bayes.trainAll(data, function() {
    bayes.toJSON(function(json) {
      assert.deepEqual(json, expected);
    });
  });
  
  if(!async)
    assert.deepEqual(bayes.toJSON(), expected);  
}

function testFrom(bayes, async) {
  var bayes = bayes.fromJSON(expected, function() {
    bayes.toJSON(function(json) {
      assert.deepEqual(json, expected);  
    })
  });
  
  if(!async)
    assert.deepEqual(bayes.toJSON(), expected);
}

testTo(new brain.BayesianClassifier());
testTo(new brain.BayesianClassifier({
  backend : {
    type: 'localStorage',
    options: {
      name: 'testnamespace',
      testing: true 
    } 
  }
}));
testTo(new brain.BayesianClassifier({
  backend : {type: 'Redis'}
}), true);


testFrom(new brain.BayesianClassifier());
testFrom(new brain.BayesianClassifier({
  backend : {
    type: 'localStorage',
    options: {
      name: 'testnamespace',
      testing: true 
    } 
  }
}));
testFrom(new brain.BayesianClassifier({
  backend : {type: 'Redis'}
}), true);
