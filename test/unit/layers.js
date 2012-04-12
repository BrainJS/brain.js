var assert = require('should'),
    brain = require("../../lib/brain");

function size(json) {
  var num = 0;
  for(var i in json)
    num++;
  return num;
}

describe('layers', function() {
  it('layer sizes', function() {
    var net = new brain.NeuralNetwork({ hidden: [4, 12, 2] });

    net.train([{input:  {a: Math.random(), b: Math.random()},
                output: {c: Math.random(), d: Math.random()}},
               {input:  {a: Math.random(), b: Math.random()},
                output: {c: Math.random(), d: Math.random()}}], 1000);

    var json = net.toJSON();

    assert.equal(json.layers.length, 5, "incorrect number of layers");


    assert.equal(size(json.layers[0].nodes), 2, "incorrect input layer size");
    assert.equal(size(json.layers[1].nodes), 4, "incorrect hidden layer 1 size");
    assert.equal(size(json.layers[2].nodes), 12, "incorrect hidden layer 2 size");
    assert.equal(size(json.layers[3].nodes), 2, "incorrect hidden layer 3 size");
    assert.equal(size(json.layers[4].nodes), 2, "incorrect output layer size");
  })


  it('grow hidden layer with more input nodes', function() {
    var net = new brain.NeuralNetwork({growthRate: 0.5});
    net.train([{input:  {a: 0, b: 0, c: 0, d: 0}, output: {}},
               {input:  {e: 0, f: 0, g: 0, h: 0, i: 0, j: 0}, output: {}}]);

    var json = net.toJSON();
    var numHidden = size(json.layers[1].nodes);

    assert.equal(numHidden, 5, "hidden layer should be 0.5 the size of input layer");
  })
})




