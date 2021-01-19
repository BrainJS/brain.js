import { NeuralNetwork } from '../../src/neural-network';

describe('neural network options', () => {
  it('hiddenLayers', () => {
    const net = new NeuralNetwork({ hiddenLayers: [8, 7] });
    net.train([
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] },
    ]);

    const json = net.toJSON();
    expect(json.layers.length).toBe(4);
    expect(json.layers[1].weights.length).toBe(8);
    expect(json.layers[2].weights.length).toBe(7);
  });

  it('hiddenLayers default expand to input size', () => {
    const net = new NeuralNetwork();
    net.train([
      { input: [0, 0, 1, 1, 1, 1, 1, 1, 1], output: [0] },
      { input: [0, 1, 1, 1, 1, 1, 1, 1, 1], output: [1] },
      { input: [1, 0, 1, 1, 1, 1, 1, 1, 1], output: [1] },
      { input: [1, 1, 1, 1, 1, 1, 1, 1, 1], output: [0] },
    ]);

    const json = net.toJSON();
    expect(json.layers.length).toBe(3);
    expect(json.layers[1].weights.length).toBe(4);
  });
});

describe('neural network constructor values', () => {
  it('iterations should be settable in the constructor', () => {
    const options = { iterations: 5 };
    const net = new NeuralNetwork(options);
    expect(options.iterations).toBe(net.trainOpts.iterations);
  });

  it('errorThresh should be settable in the constructor', () => {
    const options = { errorThresh: 0.1 };
    const net = new NeuralNetwork(options);
    expect(options.errorThresh).toBe(net.trainOpts.errorThresh);
  });

  it('log should allow setting the training options to the constructor', () => {
    const log = function () {};
    const options = { log: log };
    const net = new NeuralNetwork(options);
    expect(net.trainOpts.log).toBe(log);
  });

  it('logPeriod should be settable in the constructor', () => {
    const options = { logPeriod: 5 };
    const net = new NeuralNetwork(options);
    expect(options.logPeriod).toBe(net.trainOpts.logPeriod);
  });

  it('learningRate should be settable in the constructor', () => {
    const options = { learningRate: 0.5 };
    const net = new NeuralNetwork(options);
    expect(options.learningRate).toBe(net.trainOpts.learningRate);
  });

  it('momentum should be settable in the constructor', () => {
    const options = { momentum: 0.2 };
    const net = new NeuralNetwork(options);
    expect(options.momentum).toBe(net.trainOpts.momentum);
  });

  it('callback should be settable in the constructor', () => {
    const cb = function () {};
    const options = { callback: cb };
    const net = new NeuralNetwork(options);
    expect(net.trainOpts.callback).toBe(cb);
  });

  it('callbackPeriod should be settable in the constructor', () => {
    const options = { callbackPeriod: 2 };
    const net = new NeuralNetwork(options);
    expect(options.callbackPeriod).toBe(net.trainOpts.callbackPeriod);
  });

  it('timeout should be settable in the constructor', () => {
    const options = { timeout: 1500 };
    const net = new NeuralNetwork(options);
    expect(options.timeout).toBe(net.trainOpts.timeout);
  });

  it('binaryThresh should be settable in the constructor', () => {
    const options = { binaryThresh: 0.2 };
    const net = new NeuralNetwork(options);
    expect(options.binaryThresh).toBe(net.options.binaryThresh);
  });

  it('hiddenLayers should be settable in the constructor', () => {
    const options = { hiddenLayers: [2, 3, 4] };
    const net = new NeuralNetwork(options);
    expect(options.hiddenLayers).toEqual(net.options.hiddenLayers);
  });

  it('activation should be settable in the constructor', () => {
    const options = { activation: 'relu' };
    const net = new NeuralNetwork(options);
    expect(options.activation).toBe(net.trainOpts.activation);
  });

  it('leakyReluAlpha should be settable in the constructor', () => {
    const options = { leakyReluAlpha: 0.1337 };
    const net = new NeuralNetwork(options);
    expect(options.leakyReluAlpha).toBe(net.trainOpts.leakyReluAlpha);
  });
});
