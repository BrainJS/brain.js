var assert = require('assert'),
    brain = require("../brain");

var net = new brain.NeuralNetwork();

net.train([{input:  {a: Math.random(), b: Math.random()},
            output: {c: Math.random(), d: Math.random()}},
           {input:  {a: Math.random(), b: Math.random()},
            output: {c: Math.random(), d: Math.random()}}]);

var input = {a : Math.random(), b: Math.random()};
var output1 = JSON.stringify(net.run(input));
var output2 = JSON.stringify(net.toFunction()(input));

assert.equal(output1, output2, "standalone network function failed, expected: "
               + output1 + " got: " + output2);


