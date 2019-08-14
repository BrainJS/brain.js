const NeuralNetwork = require('../../src/neural-network');

describe('neural network options', () => {

  it('hiddenLayers', () => {
    let net = new NeuralNetwork({ hiddenLayers: [8, 7] });
    net.train([
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] }
    ]);

    let json = net.toJSON();
    expect(json.layers.length).toBe(4);
    expect(Object.keys(json.layers[1]).length).toBe(8);
    expect(Object.keys(json.layers[2]).length).toBe(7);
  });

  it('hiddenLayers default expand to input size', () => {
    let net = new NeuralNetwork();
    net.train([
      { input: [0, 0, 1, 1, 1, 1, 1, 1, 1], output: [0]},
      { input: [0, 1, 1, 1, 1, 1, 1, 1, 1], output: [1]},
      { input: [1, 0, 1, 1, 1, 1, 1, 1, 1], output: [1]},
      { input: [1, 1, 1, 1, 1, 1, 1, 1, 1], output: [0]}
    ]);

    let json = net.toJSON();
    expect(json.layers.length).toBe(3);
    expect(Object.keys(json.layers[1]).length).toBe(4);
  });
});

describe ('neural network constructor values', () => {
  it('iterations should be settable in the constructor', () => {
    let opts = { iterations: 5};
    var net = new NeuralNetwork(opts);
    expect(opts.iterations).toBe(net.trainOpts.iterations);
  });

  it('errorThresh should be settable in the constructor', () => {
    let opts = { errorThresh: 0.1 };
    var net = new NeuralNetwork(opts);
    expect(opts.errorThresh).toBe(net.trainOpts.errorThresh);
  });

  it('log should allow setting the training options to the constructor', () => {
    let log = function (res) {};
    let opts = { log: log };
    var net = new NeuralNetwork(opts);
    expect(typeof net.trainOpts.log  === 'function').toBeTruthy();
  });

  it('logPeriod should be settable in the constructor', () => {
    let opts = { logPeriod: 5 };
    var net = new NeuralNetwork(opts);
    expect(opts.logPeriod).toBe(net.trainOpts.logPeriod);
  });

  it('learningRate should be settable in the constructor', () => {
    let opts = { learningRate: 0.5 };
    var net = new NeuralNetwork(opts);
    expect(opts.learningRate).toBe(net.trainOpts.learningRate);
  });

  it('momentum should be settable in the constructor', () => {
    let opts = { momentum: 0.2 };
    var net = new NeuralNetwork(opts);
    expect(opts.momentum).toBe(net.trainOpts.momentum);
  });

  it('callback should be settable in the constructor', () => {
    let cb = function (res) {};
    let opts = { callback: cb };
    var net = new NeuralNetwork(opts);
    expect(typeof net.trainOpts.callback  === 'function').toBeTruthy();
  });

  it('callbackPeriod should be settable in the constructor', () => {
    let opts = { callbackPeriod: 2 };
    var net = new NeuralNetwork(opts);
    expect(opts.callbackPeriod).toBe(net.trainOpts.callbackPeriod);
  });

  it('timeout should be settable in the constructor', () => {
    let opts = { timeout: 1500 };
    var net = new NeuralNetwork(opts);
    expect(opts.timeout).toBe(net.trainOpts.timeout);
  });

  it('binaryThresh should be settable in the constructor', () => {
    let opts = { binaryThresh: 0.2 };
    var net = new NeuralNetwork(opts);
    expect(opts.binaryThresh).toBe(net.binaryThresh);
  });

  it('hiddenLayers should be settable in the constructor', () => {
    let opts = { hiddenLayers: [2, 3, 4] };
    var net = new NeuralNetwork(opts);
    expect(JSON.stringify(opts.hiddenLayers)).toBe(JSON.stringify(net.hiddenLayers));
  });

  it('activation should be settable in the constructor', () => {
    let opts = { activation: 'relu' };
    var net = new NeuralNetwork(opts);
    expect(opts.activation).toBe(net.activation);
  });

  it('leakyReluAlpha should be settable in the constructor', () => {
    let opts = { leakyReluAlpha: 0.1337 };
    var net = new NeuralNetwork(opts);
    expect(opts.leakyReluAlpha).toBe(net.leakyReluAlpha);
  });
});
