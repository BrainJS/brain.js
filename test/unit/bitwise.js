var assert = require("assert"),
    brain = require("../../lib/brain");

var wiggle = 0.1;

function testBitwise(data, op) {
  var net = new brain.NeuralNetwork();
  net.train(data, { errorThresh: 0.003 });

  for(var i in data) {
    var output = net.run(data[i].input);
    var target = data[i].output;
    assert.ok(output < (target + wiggle) && output > (target - wiggle),
     "failed to train " + op + " - output: " + output + " target: " + target);
  }
}

describe('bitwise functions', function() {

  it('NOT function', function() {
    var not = [{input: [0], output: [1]},
               {input: [1], output: [0]}];
    testBitwise(not, "not");
  })

  it('XOR function', function() {
    var xor = [{input: [0, 0], output: [0]},
               {input: [0, 1], output: [1]},
               {input: [1, 0], output: [1]},
               {input: [1, 1], output: [0]}];
    testBitwise(xor, "xor");
  })

  it('OR function', function() {
    var or = [{input: [0, 0], output: [0]},
              {input: [0, 1], output: [1]},
              {input: [1, 0], output: [1]},
              {input: [1, 1], output: [1]}];
    testBitwise(or, "or");
  });

  it('AND function', function() {
    var and = [{input: [0, 0], output: [0]},
               {input: [0, 1], output: [0]},
               {input: [1, 0], output: [0]},
               {input: [1, 1], output: [1]}];
    testBitwise(and, "and");
  })
})
