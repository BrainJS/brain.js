var assert = require('assert'),
    brain = require("../../../lib/brain");

var net = new brain.NeuralNetwork();

/* sparse hashes for input/output training data */
net.train([{input:  {a: Math.random(), b: Math.random(), c: Math.random()},
            output: {A: Math.random(), B: Math.random()}},

           {input:  {d: Math.random(), e: Math.random(), f : Math.random()},
            output: {C: Math.random()}},

           {input : {}, output : {}}]);

function checkLayer(nodes, layer) {
  for(var node in nodes)
    assert.ok(!!layer[nodes[node]], "couldn't find node for " + nodes[node]);
}

var json = net.toJSON();
var inputNodes = ['a', 'b', 'c', 'd', 'e', 'f'];
checkLayer(inputNodes, json.layers[0].nodes);

var outputNodes = ['A', 'B', 'C'];
checkLayer(outputNodes, json.layers[json.layers.length - 1].nodes);


/* sparse hash for input running */
var output = net.run({c: Math.random()});
checkLayer(outputNodes, output);

/* never seen before input */
var output = net.run({z: Math.random()});
checkLayer(outputNodes, output);

var json = net.toJSON();
assert.ok(!!json.layers[0].nodes['z']);

/* no input */
var output = net.run({});
checkLayer(outputNodes, output);
