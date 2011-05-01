/* sanity tests for the browser */

var assert = {
  fail : function(id) {
    $("#" + id + " .fail").addClass("true");
  },

  pass : function(id) {
    $("#" + id + " .pass").addClass("true");    
  },
  
  ok : function(truth, message, id) {
    if(!truth)
      assert.fail(id);
    else
      assert.pass(id);
  },
  equal : function(a, b, message, id) {
    if(a != b)
      assert.fail(id);
    else
      assert.pass(id);
  }
};
$(document).ready(function(){
  
  (function testNeural() {
    var wiggle = 0.1;

    function testBitwise(data, op) {
      var net = new brain.NeuralNetwork();
      net.train(data);

      for(var i in data) {
        var output = net.run(data[i].input);
        var target = data[i].output;
        assert.ok(output < (target + wiggle) && output > (target - wiggle),
         "failed to train " + op + " - output: " + output + " target: " + target, "nn-" + op);
      }
    }
 
    var and = [{input: [0, 0], output: [0]},
               {input: [0, 1], output: [0]},
               {input: [1, 0], output: [0]},
               {input: [1, 1], output: [1]}];
    testBitwise(and, "and");

    var or = [{input: [0, 0], output: [0]},
              {input: [0, 1], output: [1]},
              {input: [1, 0], output: [1]},
              {input: [1, 1], output: [1]}];
    testBitwise(or, "or");
  })();

  (function testBayesian() {
    function testBasic(bayes, id) {
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

      assert.ok(
        bayes.classify("replica watches") == "spam" &&
        bayes.classify("check out the docs") == "notspam" &&
        bayes.classify("recently, I've been thinking that I should") == "notspam" &&
        bayes.classify("come buy these cheap pills") == "spam"
      , "bayes classification error", id);
    }

    // test the synchronous backends
    testBasic(new brain.BayesianClassifier(), "bayes");

    testBasic(new brain.BayesianClassifier({
      backend : {
        type: 'localStorage',
        options: {
          name: 'testnamespace',
          testing: true 
        } 
      }
    }), "bayes-localStorage");
  })();
});