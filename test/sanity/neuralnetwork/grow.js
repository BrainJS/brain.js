var assert = require('assert'),
    brain = require("../../lib/brain");

function size(json) {
  var num = 0;
  for(var i in json)
    num++;
  return num;
}

var net = new brain.NeuralNetwork({growthRate: 0.5});
net.train([{input:  {a: 0, b: 0, c: 0, d: 0}, output: {}},
           {input:  {e: 0, f: 0, g: 0, h: 0, i: 0, j: 0}, output: {}}]);

var json = net.toJSON();
var numHidden = size(json.layers[1].nodes);

assert.equal(numHidden, 5, "hidden layer should be 0.5 the size of input layer");

