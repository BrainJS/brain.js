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

describe('train() and trainAsync() use the same internal methods', () => {
  
  it(' _prepTraining()', (done) => {
    let trainingData = [ { input: [0, 0], output: [0] } ];
    var net = new brain.NeuralNetwork();
    let tick = 0;
    net._prepTraining = (d, o) => {
      tick++;
      if (tick === 2) return done ();
      return net._prepTraining(d, o);
    };
    net.train(trainingData, {iterations: 1});
    assert.ok(false);
    net.trainAsync(trainingData, {iterations: 1});
  });

  it(' _updateTrainingOptions()', (done) => {
    let trainingData = [ { input: [0, 0], output: [0] } ];
    var net = new brain.NeuralNetwork();
    let tick = 0;
    net._updateTrainingOptions = (o) => {
      tick++;
      if (tick === 2) return done ();
      return net._updateTrainingOptions(o);
    };
    net.train(trainingData, {iterations: 1});
    assert.ok(false);
    net.trainAsync(trainingData, {iterations: 1});
  });

  it(' _formatData()', (done) => {
    let trainingData = [ { input: [0, 0], output: [0] } ];
    var net = new brain.NeuralNetwork();
    let tick = 0;
    net._formatData = (d) => {
      tick++;
      if (tick === 2) return done ();
      return net._formatData(d);
    };
    net.train(trainingData, {iterations: 1});
    assert.ok(false);
    net
      .trainAsync(trainingData, {iterations: 1})
      .then()
      .catch(assert.ifError);
  });

  it(' _verifyIsInitialized()', (done) => {
    let trainingData = [ { input: [0, 0], output: [0] } ];
    var net = new brain.NeuralNetwork();
    let tick = 0;
    net._verifyIsInitialized = (d) => {
      tick++;
      if (tick === 2) return done ();
      return net._verifyIsInitialized(d);
    };
    net.train(trainingData, {iterations: 1});
    assert.ok(false);
    net.trainAsync(trainingData, {iterations: 1});
  });

  it(' _trainingTick()', (done) => {
    let trainingData = [ { input: [0, 0], output: [0] } ];
    var net = new brain.NeuralNetwork();
    let tick = 0;
    net._trainingTick = (d, o, e) => {
      tick++;
      if (tick === 2) return done ();
      return net._trainingTick(d, o, e);
    };
    net.train(trainingData, {iterations: 1});
    assert.ok(false);
    net.trainAsync(trainingData, {iterations: 1});
  });
});