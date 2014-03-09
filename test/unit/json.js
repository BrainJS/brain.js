var assert = require("assert"),
    brain = require("../../lib/brain");

describe('JSON', function() {
  var net = new brain.NeuralNetwork();

  net.train([{input:  {"0": Math.random(), b: Math.random()},
              output: {c: Math.random(), "0": Math.random()}},
             {input:  {"0": Math.random(), b: Math.random()},
              output: {c: Math.random(), "0": Math.random()}}]);

  var serialized = net.toJSON();
  var net2 = new brain.NeuralNetwork().fromJSON(serialized);

  var input = {"0" : Math.random(), b: Math.random()};

  it('toJSON()/fromJSON()', function() {
    var output1 = net.run(input);
    var output2 = net2.run(input);

    assert.equal(JSON.stringify(output1), JSON.stringify(output2),
                  "loading json serialized network failed");
  })


  it('toFunction()', function() {
    var output1 = net.run(input);
    var output2 = net.toFunction()(input);

    assert.equal(JSON.stringify(output1), JSON.stringify(output2),
                   "standalone network function failed");
  })
})
