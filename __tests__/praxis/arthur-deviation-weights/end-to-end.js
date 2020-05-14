/* istanbul ignore file */
const { GPU } = require('gpu.js');
const {
  ArthurDeviationWeights,
} = require('../../../src/praxis/arthur-deviation-weights');
const { random } = require('../../../src/layer/random');
const NeuralNetwork = require('../../../src/neural-network');
const { setup, teardown } = require('../../../src/utilities/kernel');
const { injectIstanbulCoverage } = require('../../test-utils');

describe('ArthurDeviationWeights Class: End to End', () => {
  beforeEach(() => {
    setup(
      new GPU({
        mode: 'cpu',
        onIstanbulCoverageVariable: injectIstanbulCoverage,
      })
    );
  });
  afterEach(() => {
    teardown();
  });
  describe('.run()', () => {
    test('correctly runs values', () => {
      const layer = { weights: [[1]], deltas: [[1]], width: 1, height: 1 };
      const praxis = new ArthurDeviationWeights(layer, {
        weightsLayer: {
          weights: [[1]],
          deltas: [[1]],
        },
        incomingLayer: {
          weights: [[1]],
          deltas: [[1]],
        },
        deltaLayer: {
          weights: [[1]],
          deltas: [[1]],
        },
      });
      const result = praxis.run(layer);
      expect(result[0][0].toFixed(5)).toEqual((1.3).toFixed(5).toString());
    });
  });
  test('matches NeuralNetwork.adjustWeights output', () => {
    const xorTrainingData = [
      { input: [0, 1], output: [1] },
      { input: [0, 0], output: [0] },
      { input: [1, 1], output: [0] },
      { input: [1, 0], output: [1] },
    ];
    const net = new NeuralNetwork();
    net.train(xorTrainingData, {
      iterations: 1,
    });

    const inputs = random({ name: 'input', height: 2 });
    const weights = random({ name: 'weights', height: 3, width: 2 });
    const biases = random({ name: 'biases', height: 3 });

    const praxis = new ArthurDeviationWeights(weights, {
      weightsLayer: weights,
      incomingLayer: inputs,
      deltaLayer: biases,
      learningRate: net.trainOpts.learningRate,
    });
    expect(praxis.learningRate).toBe(net.trainOpts.learningRate);
    inputs.weights[0][0] = net.outputs[0][0] = 11;
    inputs.weights[1][0] = net.outputs[0][1] = 22;

    praxis.changes[0][0] = net.changes[1][0][0] = 1;
    praxis.changes[0][1] = net.changes[1][0][1] = 2;

    praxis.changes[1][0] = net.changes[1][1][0] = 3;
    praxis.changes[1][1] = net.changes[1][1][1] = 4;

    praxis.changes[2][0] = net.changes[1][2][0] = 5;
    praxis.changes[2][1] = net.changes[1][2][1] = 6;

    net.changes[2][0][0] = 7;
    net.changes[2][0][2] = 8;
    net.changes[2][0][3] = 9;

    weights.weights[0][0] = net.weights[1][0][0] = 1;
    weights.weights[0][1] = net.weights[1][0][1] = 2;

    weights.weights[1][0] = net.weights[1][1][0] = 3;
    weights.weights[1][1] = net.weights[1][1][1] = 4;

    weights.weights[2][0] = net.weights[1][2][0] = 5;
    weights.weights[2][1] = net.weights[1][2][1] = 6;

    biases.weights[0][0] = net.weights[2][0][0] = 7;
    biases.weights[1][0] = net.weights[2][0][1] = 8;
    biases.weights[2][0] = net.weights[2][0][2] = 9;

    net.deltas[0][0] = 1;
    net.deltas[0][1] = 2;

    biases.deltas[0][0] = net.deltas[1][0] = 3;
    biases.deltas[1][0] = net.deltas[1][1] = 4;
    biases.deltas[2][0] = net.deltas[1][2] = 5;

    net.deltas[2][0] = 6;

    net.adjustWeights();
    const result = praxis.run();
    expect(praxis.changes[0][0]).toBe(net.changes[1][0][0]);
    expect(praxis.changes[0][1]).toBe(net.changes[1][0][1]);

    expect(praxis.changes[1][0]).toBe(net.changes[1][1][0]);
    expect(praxis.changes[1][1]).toBe(net.changes[1][1][1]);

    expect(praxis.changes[2][0]).toBe(net.changes[1][2][0]);
    expect(praxis.changes[2][1]).toBe(net.changes[1][2][1]);

    expect(result[0][0]).toBe(net.weights[1][0][0]);
    expect(result[0][1]).toBe(net.weights[1][0][1]);

    expect(result[1][0]).toBe(net.weights[1][1][0]);
    expect(result[1][1]).toBe(net.weights[1][1][1]);

    expect(result[2][0]).toBe(net.weights[1][2][0]);
    expect(result[2][1]).toBe(net.weights[1][2][1]);
  });
});
