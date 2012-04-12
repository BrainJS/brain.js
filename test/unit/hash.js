var assert = require('should'),
    brain = require("../../lib/brain");

function checkLayer(nodes, layer) {
  for (var node in nodes) {
    assert.ok(!!layer[nodes[node]], "couldn't find node for " + nodes[node]);
  }
}


describe('hashes', function() {
  var net = new brain.NeuralNetwork();

  net.train([{input:  {a: Math.random(), b: Math.random(), c: Math.random()},
              output: {A: Math.random(), B: Math.random()}},

             {input:  {d: Math.random(), e: Math.random(), f : Math.random()},
              output: {C: Math.random()}},

             {input : {}, output : {}}]);

  var json = net.toJSON();

  var inputNodes = ['a', 'b', 'c', 'd', 'e', 'f'];
  var outputNodes = ['A', 'B', 'C'];

  it('input layer nodes', function() {
    checkLayer(inputNodes, json.layers[0].nodes);
  })

  it('output layer nodes', function() {
    checkLayer(outputNodes, json.layers[json.layers.length - 1].nodes);
  })

  it('output layer from sparse hash output', function() {
    var output = net.run({c: Math.random()});
    checkLayer(outputNodes, output);
  })

  it('output layer from output with new property', function() {
    var output = net.run({z: Math.random()});
    checkLayer(outputNodes, output);

    var json = net.toJSON();
    assert.ok(!!json.layers[0].nodes['z']);
  })

  it('output layer from empty hash input', function() {
    var output = net.run({});
    checkLayer(outputNodes, output);
  })
})
