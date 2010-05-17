var assert = require('assert'),
    brain = require("../brain");

var net = new brain.NeuralNetwork({hiddenLayers: [4, 12, 2]});

net.train([{input:  {a: Math.random(), b: Math.random()},
            target: {c: Math.random(), d: Math.random()}},
           {input:  {a: Math.random(), b: Math.random()},
            target: {c: Math.random(), d: Math.random()}}]);

var json = net.toJSON();

assert.equal(json.layers.length, 5, "incorrect number of layers, expected: "
               + 5 + " got: " + json.layers.length);

function size(json) {
  var num = 0;
  for(var i in json)
    num++;
  return num;
}

assert.equal(size(json.layers[0].nodes), 2, "incorrect input layer size");
assert.equal(size(json.layers[1].nodes), 4, "incorrect hidden layer 1 size");
assert.equal(size(json.layers[2].nodes), 12, "incorrect hidden layer 2 size");
assert.equal(size(json.layers[3].nodes), 2, "incorrect hidden layer 3 size");
assert.equal(size(json.layers[4].nodes), 2, "incorrect output layer size");


