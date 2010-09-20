var assert = require('assert'),
    brain = require("../../../lib/brain");

var net = new brain.NeuralNetwork();

net.train([{input:  {a: Math.random(), b: Math.random()},
            output: {c: Math.random(), d: Math.random()}},
           {input:  {a: Math.random(), b: Math.random()},
            output: {c: Math.random(), d: Math.random()}}]);

var serialized = net.toJSON();
var net2 = new brain.NeuralNetwork().fromJSON(serialized);

var input = {a : Math.random(), b: Math.random()};
var output1 = net.run(input);
var output2 = net2.run(input);

assert.equal(JSON.stringify(output1), JSON.stringify(output2),
              "loading json serialized network failed");


