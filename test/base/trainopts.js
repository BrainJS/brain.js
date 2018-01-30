import assert from 'assert';
import brain from '../../src';

let data = [{input: [0, 0], output: [0]},
            {input: [0, 1], output: [1]},
            {input: [1, 0], output: [1]},
            {input: [1, 1], output: [1]}];

describe('train() options', () => {
  it('train until error threshold reached', () => {
    let net = new brain.NeuralNetwork();
    let res = net.train(data, { errorThresh: 0.2 });
    assert.ok(res.error < 0.2, `[res.error, ${res.error}] should have been less then 0.2`);
  });

  it('train until max iterations reached', () => {
    let net = new brain.NeuralNetwork();
    let res = net.train(data, { iterations: 25 });
    assert.equal(res.iterations, 25, `[res.iterations, ${res.iterations}] should have been less then 25`);
  });

  it('training callback called with training stats', () => {
    let iters = 100;
    let period = 20;
    let target = iters / period;

    let calls = 0;

    let net = new brain.NeuralNetwork();
    net.train(data, {
      iterations: iters,
      callbackPeriod: period,
      callback: (res) => {
        assert.ok(res.iterations % period == 0);
        calls++;
      }
    });
    assert.ok(target === calls, `[calls, ${calls}] should be the same as [target, ${target}]`);
  });

  it('learningRate - higher learning rate should train faster', () => {
    let data = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [1] }
    ];

    let net = new brain.NeuralNetwork();
    let res = net.train(data, { learningRate: 0.5 });

    let net2 = new brain.NeuralNetwork();
    let res2 = net2.train(data, { learningRate: 0.8 });

    assert.ok(res.iterations > (res2.iterations * 1.1), `${res.iterations} should be greater than ${res2.iterations * 1.1}`);
  });


  it('momentum - higher momentum should train faster', () => {
    let data = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [1] }
    ];

    let net = new brain.NeuralNetwork({ momentum: 0.1 });
    let res = net.train(data)

    let net2 = new brain.NeuralNetwork({ momentum: 0.5 });
    let res2 = net2.train(data)

    assert.ok(res.iterations > (res2.iterations * 1.1), `${res.iterations} !> ${res2.iterations * 1.1}`);
  });
});


describe('async train() options', () => {
  it('train until error threshold reached', (done) => {
    let net = new brain.NeuralNetwork();
    let p1 = net
      .trainAsync(data, { errorThresh: 0.2 })
      .then (res => {
        assert.ok(res.error < 0.2, `[res.error, ${res.error}] should have been less then 0.2`);
        done();
      })
      .catch(err => { assert.ok(false, err.toString()) });
  }).timeout(10000);

  it('train until max iterations reached', (done) => {
    let net = new brain.NeuralNetwork();
    let res = net
      .trainAsync(data, { iterations: 25 })
      .then(res => {
        assert.equal(res.iterations, 25, `[res.iterations, ${res.iterations}] should have been less then 25`);
        done();
      })
      .catch(err => { assert.ok(false, err.toString()) });
  }).timeout(10000);

  it('asyinc training callback called with training stats', (done) => {
    let iters = 100;
    let period = 20;
    let target = iters / period;

    let calls = 0;

    let net = new brain.NeuralNetwork();
    net.trainAsync(data, {
      iterations: iters,
      callbackPeriod: period,
      callback: (res) => {
        assert.ok(res.iterations % period == 0);
        calls++;
      }
    })
    .then (res => {
      assert.ok(target === calls, `[calls, ${calls}] should be the same as [target, ${target}]`);
      done();
    })
    .catch(err => { assert.ok(false, err.toString()) });
  }).timeout(10000);

  it('learningRate ASYNC - higher learning rate should train faster', (done) => {
    let data = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [1] }
    ];

    let net = new brain.NeuralNetwork();
    let net2 = new brain.NeuralNetwork();

    let p1 = net.trainAsync(data, { learningRate: 0.5 });
    let p2 = net2.trainAsync(data, { learningRate: 0.8 });

    Promise
      .all([p1, p2])
      .then(values => {
        let res = values[0];
        let res2 = values[1];
        assert.ok(res.iterations > (res2.iterations * 1.1), `${res.iterations} !> ${res2.iterations * 1.1}`);
        done();
      })
      .catch(err => {
        assert.ok(false, err.toString())
      });
  }).timeout(10000);

  it('momentum ASYNC - higher momentum should train faster', (done) => {
    let data = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [1] }
    ];

    let net = new brain.NeuralNetwork({ momentum: 0.1 });
    let net2 = new brain.NeuralNetwork({ momentum: 0.5 });

    let p1 = net.trainAsync(data);
    let p2 = net2.trainAsync(data);

    Promise.all([p1, p2])
      .then(values => {
        let res = values[0];
        let res2 = values[1];
        assert.ok(res.iterations > (res2.iterations * 1.1), `${res.iterations} !> ${res2.iterations * 1.1}`);
        done();
      }).catch(err => {
        assert.ok(false, err.toString())
      });
  }).timeout(10000);
});
