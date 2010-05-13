var assert = require('assert'),
    brain = require("../brain");

var wiggle = 0.1;

function testBitwise(net, data, op) {
  for(var i in data) {
    var output = net.run(data[i].input);
    var target = data[i].target;
    assert.ok(output < (target + wiggle) && output > (target - wiggle),
     "failed to train " + op + " - output: " + output + " target: " + target);
  }
}

var not = [{input: [0], target: [1]},
           {input: [1], target: [0]}];
var net = new brain.NeuralNetwork();
net.train(not);
testBitwise(net, not, "not");

var xor = [{input: [0, 0], target: [0]},
           {input: [0, 1], target: [1]},
           {input: [1, 0], target: [1]},
           {input: [1, 1], target: [0]}];
var net = new brain.NeuralNetwork();
net.train(xor);
testBitwise(net, xor, "xor");

var or = [{input: [0, 0], target: [0]},
          {input: [0, 1], target: [1]},
          {input: [1, 0], target: [1]},
          {input: [1, 1], target: [1]}];
var net = new brain.NeuralNetwork();
net.train(or);
testBitwise(net, or, "or");

var and = [{input: [0, 0], target: [0]},
           {input: [0, 1], target: [0]},
           {input: [1, 0], target: [0]},
           {input: [1, 1], target: [1]}];
var net = new brain.NeuralNetwork();
net.train(and);
testBitwise(net, and, "and");
