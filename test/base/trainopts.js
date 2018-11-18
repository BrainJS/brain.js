import assert from 'assert';
import brain from '../../src';
import sinon from 'sinon'

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

describe('train() and trainAsync() use the same private methods', () => {
  let trainingData = [{ input: [0, 0], output: [0] }];
  let opts = { iterations:1 };
  let net = new brain.NeuralNetwork();
  let methodsChecked = [
    'prepTraining',
    'updateTrainingOptions',
    'formatData',
    'verifyIsInitialized',
    'trainingTick'
  ];

  beforeEach(() => { methodsChecked.forEach(m => sinon.spy(net, m)); });
  afterEach(() => { methodsChecked.forEach(m => net[m].restore()); });

  it('.prepTraining()', (done) => {
    net.train(trainingData, opts);
    assert(net.prepTraining.calledOnce, `_prepTraining was expected to be called once but was called ${net.prepTraining.callCount}`);
    net
      .trainAsync(trainingData, opts)
      .then(() => {
        assert(net.prepTraining.calledTwice, `_prepTraining was expected to be called twice but was called ${net.prepTraining.callCount}`);
        done();
      })
      .catch(e => {
        assert.ok(false, e.toString());
        done()
      });
  });

  it('.updateTrainingOptions()', (done) => {
    net.train(trainingData, opts);
    assert(net.updateTrainingOptions.calledOnce, `_updateTrainingOptions was expected to be called once but was called ${net.updateTrainingOptions.callCount}`);
    net
      .trainAsync(trainingData, opts)
      .then(() => {
        assert(net.updateTrainingOptions.calledTwice, `_updateTrainingOptions was expected to be called twice but was called ${net.prepTraining.callCount}`);
        done();
      })
      .catch(e => {
        assert.ok(false, e.toString());
        done()
      });
  });

  it('.formatData()', (done) => {
    net.train(trainingData, opts);
    assert(net.formatData.calledOnce, `_formatData was expected to be called once but was called ${net.formatData.callCount}`);
    net
      .trainAsync(trainingData, opts)
      .then(() => {
        assert(net.formatData.calledTwice, `_formatData was expected to be called twice but was called ${net.prepTraining.callCount}`);
        done();
      })
      .catch(e => {
        assert.ok(false, e.toString());
        done()
      });
  });

  it('.verifyIsInitialized()', (done) => {
    net.train(trainingData, opts);
    assert(net.verifyIsInitialized.calledOnce, `_verifyIsInitialized was expected to be called once but was called ${net.verifyIsInitialized.callCount}`);
    net
      .trainAsync(trainingData, opts)
      .then(() => {
        assert(net.verifyIsInitialized.calledTwice, `_verifyIsInitialized was expected to be called twice but was called ${net.prepTraining.callCount}`);
        done();
      })
      .catch(e => {
        assert.ok(false, e.toString());
        done()
      });
  });

  it('.trainingTick()', (done) => {
    net.train(trainingData, opts);
    // The loop calls _trainingTick twice and returns immediately on second call
    assert(net.trainingTick.calledTwice, `_trainingTick was expected to be called twice but was called ${net.prepTraining.callCount}`);
    net
      .trainAsync(trainingData, opts)
      .then(() => {
        // trainAsync only calls _trainingTick once
        assert(net.trainingTick.calledThrice, `_trainingTick was expected to be called thrice but was called ${net.prepTraining.callCount}`);
        done();
      })
      .catch(e => {
        assert.ok(false, e.toString());
        done()
      });
  });
});

describe('training options validation', () => {
  it('iterations validation', () => {
    let net = new brain.NeuralNetwork();
    assert.throws(() => { net.updateTrainingOptions({ iterations: 'should be a string' }) });
    assert.throws(() => { net.updateTrainingOptions({ iterations: () => {} }) });
    assert.throws(() => { net.updateTrainingOptions({ iterations: false }) });
    assert.throws(() => { net.updateTrainingOptions({ iterations: -1 }) });
    assert.doesNotThrow(() => { net.updateTrainingOptions({ iterations: 5000 }) });
  });

  it('errorThresh validation', () => {
    let net = new brain.NeuralNetwork();
    assert.throws(() => { net.updateTrainingOptions({ errorThresh: 'no strings'}) });
    assert.throws(() => { net.updateTrainingOptions({ errorThresh: () => {} }) });
    assert.throws(() => { net.updateTrainingOptions({ errorThresh: 5}) });
    assert.throws(() => { net.updateTrainingOptions({ errorThresh: -1}) });
    assert.throws(() => { net.updateTrainingOptions({ errorThresh: false}) });
    assert.doesNotThrow(() => { net.updateTrainingOptions({ errorThresh: 0.008}) });
  });

  it('log validation', () => {
    let net = new brain.NeuralNetwork();
    assert.throws(() => { net.updateTrainingOptions({ log: 'no strings' }) });
    assert.throws(() => { net.updateTrainingOptions({ log: 4 }) });
    assert.doesNotThrow(() => { net.updateTrainingOptions({ log: false }) });
    assert.doesNotThrow(() => { net.updateTrainingOptions({ log: () => {} }) });
  });

  it('logPeriod validation', () => {
    let net = new brain.NeuralNetwork();
    assert.throws(() => { net.updateTrainingOptions({ logPeriod: 'no strings' }) });
    assert.throws(() => { net.updateTrainingOptions({ logPeriod: -50 }) });
    assert.throws(() => { net.updateTrainingOptions({ logPeriod: () => {} }) });
    assert.throws(() => { net.updateTrainingOptions({ logPeriod: false }) });
    assert.doesNotThrow(() => { net.updateTrainingOptions({ logPeriod: 40 }) });
  });

  it('learningRate validation', () => {
    let net = new brain.NeuralNetwork();
    assert.throws(() => { net.updateTrainingOptions({ learningRate: 'no strings' }) });
    assert.throws(() => { net.updateTrainingOptions({ learningRate: -50 }) });
    assert.throws(() => { net.updateTrainingOptions({ learningRate: 50 }) });
    assert.throws(() => { net.updateTrainingOptions({ learningRate: () => {} }) });
    assert.throws(() => { net.updateTrainingOptions({ learningRate: false }) });
    assert.doesNotThrow(() => { net.updateTrainingOptions({ learningRate: 0.5 }) });
  });

  it('momentum validation', () => {
    let net = new brain.NeuralNetwork();
    assert.throws(() => { net.updateTrainingOptions({ momentum: 'no strings' }) });
    assert.throws(() => { net.updateTrainingOptions({ momentum: -50 }) });
    assert.throws(() => { net.updateTrainingOptions({ momentum: 50 }) });
    assert.throws(() => { net.updateTrainingOptions({ momentum: () => {} }) });
    assert.throws(() => { net.updateTrainingOptions({ momentum: false }) });
    assert.doesNotThrow(() => { net.updateTrainingOptions({ momentum: 0.8 }) });
  });

  it('callback validation', () => {
    let net = new brain.NeuralNetwork();
    assert.throws(() => { net.updateTrainingOptions({ callback: 'no strings' }) });
    assert.throws(() => { net.updateTrainingOptions({ callback: 4 }) });
    assert.throws(() => { net.updateTrainingOptions({ callback: false }) });
    assert.doesNotThrow(() => { net.updateTrainingOptions({ callback: null }) });
    assert.doesNotThrow(() => { net.updateTrainingOptions({ callback: () => {} }) });
  });

  it('callbackPeriod validation', () => {
    let net = new brain.NeuralNetwork();
    assert.throws(() => { net.updateTrainingOptions({ callbackPeriod: 'no strings' }) });
    assert.throws(() => { net.updateTrainingOptions({ callbackPeriod: -50 }) });
    assert.throws(() => { net.updateTrainingOptions({ callbackPeriod: () => {} }) });
    assert.throws(() => { net.updateTrainingOptions({ callbackPeriod: false }) });
    assert.doesNotThrow(() => { net.updateTrainingOptions({ callbackPeriod: 40 }) });
  });

  it('timeout validation', () => {
    let net = new brain.NeuralNetwork();
    assert.throws(() => { net.updateTrainingOptions({ timeout: 'no strings' }) });
    assert.throws(() => { net.updateTrainingOptions({ timeout: -50 }) });
    assert.throws(() => { net.updateTrainingOptions({ timeout: () => {} }) });
    assert.throws(() => { net.updateTrainingOptions({ timeout: false }) });
    assert.doesNotThrow(() => { net.updateTrainingOptions({ timeout: 40 }) });
  });

  it('should handle unsupported options', () => {
    let net = new brain.NeuralNetwork();
    assert.doesNotThrow(() => { net.updateTrainingOptions({ fakeProperty: 'should be handled fine' }) });
  })
});
