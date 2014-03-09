var assert = require("assert"),
    brain = require("../../lib/brain");

var data = [{input: [0, 0], output: [0]},
            {input: [0, 1], output: [1]},
            {input: [1, 0], output: [1]},
            {input: [1, 1], output: [1]}];

describe('train() options', function() {
  it('train until error threshold reached', function() {
    var net = new brain.NeuralNetwork();
    var error = net.train(data, {
      errorThresh: 0.2,
      iterations: 100000
    }).error;

    assert.ok(error < 0.2, "network did not train until error threshold was reached");
  });

  it('train until max iterations reached', function() {
    var net = new brain.NeuralNetwork();
    var stats = net.train(data, {
      errorThresh: 0.001,
      iterations: 1
    });

    assert.equal(stats.iterations, 1);
  })

  it('training callback called with training stats', function(done) {
    var iters = 100;
    var period = 20;
    var target = iters / 20;

    var calls = 0;

    var net = new brain.NeuralNetwork();
    net.train(data, {
      iterations: iters,
      callback: function(stats) {
        assert.ok(stats.iterations % period == 0);

        calls++;
        if (calls == target) {
          done();
        }
      },
      callbackPeriod: 20
    });
  });
})
