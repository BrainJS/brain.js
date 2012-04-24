var assert = require('should'),
    brain = require("../../lib/brain");

describe('JSON', function() {
  var net = new brain.NeuralNetwork();

  net.train([{input:  {a: Math.random(), b: Math.random()},
              output: {c: Math.random(), d: Math.random()}},
             {input:  {a: Math.random(), b: Math.random()},
              output: {c: Math.random(), d: Math.random()}}]);

  var serialized = net.toJSON();
  var net2 = new brain.NeuralNetwork().fromJSON(serialized);

  var input = {a : Math.random(), b: Math.random()};

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
