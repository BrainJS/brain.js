var assert = require('assert'),
    brain = require("../brain");

var data = [{input: [0, 0], target: [0]},
            {input: [0, 1], target: [1]},
            {input: [1, 0], target: [1]},
            {input: [1, 1], target: [1]}];

var net = new brain.NeuralNetwork();
var error = net.train(data, 10000000, 0.2);
assert.ok(error < 0.2, "network did not train until error threshold was reached");


var net = new brain.NeuralNetwork();
var error = net.train(data, 1, 0.001);
assert.ok(error > 0.001, "network trained past max iterations");

