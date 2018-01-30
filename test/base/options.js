import assert from 'assert';
import brain from '../../src';

describe('neural network options', () => {

  it('hiddenLayers', () => {
    let net = new brain.NeuralNetwork({ hiddenLayers: [8, 7] });
    net.train([
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] }
    ]);

    let json = net.toJSON();
    assert.equal(json.layers.length, 4);
    assert.equal(Object.keys(json.layers[1]).length, 8);
    assert.equal(Object.keys(json.layers[2]).length, 7);
  });

  it('hiddenLayers default expand to input size', () => {
    let net = new brain.NeuralNetwork();
    net.train([
      { input: [0, 0, 1, 1, 1, 1, 1, 1, 1], output: [0]},
      { input: [0, 1, 1, 1, 1, 1, 1, 1, 1], output: [1]},
      { input: [1, 0, 1, 1, 1, 1, 1, 1, 1], output: [1]},
      { input: [1, 1, 1, 1, 1, 1, 1, 1, 1], output: [0]}
    ]);

    let json = net.toJSON();
    assert.equal(json.layers.length, 3);
    assert.equal(Object.keys(json.layers[1]).length, 4, `9 input units should be 4 hidden not ${Object.keys(json.layers[1]).length}`);
  });
})


describe ('neural network constructor values', () => {
  it('iterations should be settable in the constructor', () => {
    let opts = { iterations: 5};
    var net = new brain.NeuralNetwork(opts);
    assert.equal(opts.iterations, net.trainOpts.iterations, `iterations => ${net.trainOpts.iterations} but should be ${opts.iterations}`);
  })

  it('errorThresh should be settable in the constructor', () => {
    let opts = { errorThresh: 0.1 };
    var net = new brain.NeuralNetwork(opts);
    assert.equal(opts.errorThresh, net.trainOpts.errorThresh, `errorThresh => ${net.trainOpts.errorThresh} but should be ${opts.errorThresh}`);
  })

  it('log should allow setting the training options to the constructor', () => {
    let log = function (res) {};
    let opts = { log: log };
    var net = new brain.NeuralNetwork(opts);
    assert.ok(typeof net.trainOpts.log  === 'function', `log => ${net.trainOpts.log} but should be ${opts.log}`);
  })

  it('logPeriod should be settable in the constructor', () => {
    let opts = { logPeriod: 5 };
    var net = new brain.NeuralNetwork(opts);
    assert.equal(opts.logPeriod, net.trainOpts.logPeriod, `logPeriod => ${net.trainOpts.logPeriod} but should be ${opts.logPeriod}`);
  })

  it('learningRate should be settable in the constructor', () => {
    let opts = { learningRate: 0.5 };
    var net = new brain.NeuralNetwork(opts);
    assert.equal(opts.learningRate, net.trainOpts.learningRate, `learningRate => ${net.trainOpts.learningRate} but should be ${opts.learningRate}`);
  })

  it('momentum should be settable in the constructor', () => {
    let opts = { momentum: 0.2 };
    var net = new brain.NeuralNetwork(opts);
    assert.equal(opts.momentum, net.trainOpts.momentum, `momentum => ${net.trainOpts.momentum} but should be ${opts.momentum}`);
  })

  it('callback should be settable in the constructor', () => {
    let cb = function (res) {};
    let opts = { callback: cb };
    var net = new brain.NeuralNetwork(opts);
    assert.ok(typeof net.trainOpts.callback  === 'function', `callback => ${net.trainOpts.callback} but should be ${opts.callback}`);
  })

  it('callbackPeriod should be settable in the constructor', () => {
    let opts = { callbackPeriod: 2 };
    var net = new brain.NeuralNetwork(opts);
    assert.equal(opts.callbackPeriod, net.trainOpts.callbackPeriod, `callbackPeriod => ${net.trainOpts.callbackPeriod} but should be ${opts.callbackPeriod}`);
  })

  it('timeout should be settable in the constructor', () => {
    let opts = { timeout: 1500 };
    var net = new brain.NeuralNetwork(opts);
    assert.equal(opts.timeout, net.trainOpts.timeout, `timeout => ${net.trainOpts.timeout} but should be ${opts.timeout}`);
  })

  it('binaryThresh should be settable in the constructor', () => {
    let opts = { binaryThresh: 0.2 };
    var net = new brain.NeuralNetwork(opts);
    assert.equal(opts.binaryThresh, net.binaryThresh, `binaryThresh => ${net.binaryThresh} but should be ${opts.binaryThresh}`);
  })

  it('hiddenLayers should be settable in the constructor', () => {
    let opts = { hiddenLayers: [2, 3, 4] };
    var net = new brain.NeuralNetwork(opts);
    assert.equal(JSON.stringify(opts.hiddenLayers), JSON.stringify(net.hiddenLayers), `hiddenLayers => ${net.hiddenLayers} but should be ${opts.hiddenLayers}`);
  })

  it('activation should be settable in the constructor', () => {
    let opts = { activation: 'relu' };
    var net = new brain.NeuralNetwork(opts);
    assert.equal(opts.activation, net.activation, `activation => ${net.activation} but should be ${opts.activation}`);
  })
});