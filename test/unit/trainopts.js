import assert from 'assert';
import brain from '../../src';

let data = [{input: [0, 0], output: [0]},
            {input: [0, 1], output: [1]},
            {input: [1, 0], output: [1]},
            {input: [1, 1], output: [1]}];

describe('train() options', () => {
  it('train until error threshold reached', () => {
    let net = new brain.NeuralNetwork();
    let error = net.train(data, {
      errorThresh: 0.2,
      iterations: 100000
    }).error;

    assert.ok(error < 0.2, 'network did not train until error threshold was reached');
  });

  it('train until max iterations reached', () => {
    let net = new brain.NeuralNetwork();
    let stats = net.train(data, {
      errorThresh: 0.001,
      iterations: 1
    });

    assert.equal(stats.iterations, 1);
  });

  it('training callback called with training stats', (done) => {
    let iters = 100;
    let period = 20;
    let target = iters / 20;

    let calls = 0;

    let net = new brain.NeuralNetwork();
    net.train(data, {
      iterations: iters,
      callback: (stats) => {
        assert.ok(stats.iterations % period == 0);

        calls++;
        if (calls == target) {
          done();
        }
      },
      callbackPeriod: 20
    });
  });
});
