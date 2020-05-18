/* istanbul ignore file */
const { GPU } = require('gpu.js');
const {
  ArthurDeviationBiases,
} = require('../../../src/praxis/arthur-deviation-biases');
const { random } = require('../../../src/layer/random');
const NeuralNetwork = require('../../../src/neural-network');
const { setup, teardown } = require('../../../src/utilities/kernel');
const { injectIstanbulCoverage } = require('../../test-utils');

describe('ArthurDeviationBiases', () => {
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
      const praxis = new ArthurDeviationBiases(layer);
      const result = praxis.run(layer);
      expect(result[0][0].toFixed(5)).toEqual((1.3).toFixed(5).toString());
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
      const layer1 = random({ name: 'biases', height: 3 });
      const praxis = new ArthurDeviationBiases(layer1, {
        learningRate: net.trainOpts.learningRate,
      });
      expect(praxis.learningRate).toBe(net.trainOpts.learningRate);

      net.deltas[0][0] = 1;
      net.deltas[0][1] = 2;

      layer1.deltas[0][0] = net.deltas[1][0] = 3;
      layer1.deltas[1][0] = net.deltas[1][1] = 4;
      layer1.deltas[2][0] = net.deltas[1][2] = 5;

      net.deltas[2][0] = 6;

      layer1.weights[0][0] = net.biases[1][0] = 7;
      layer1.weights[1][0] = net.biases[1][1] = 8;
      layer1.weights[2][0] = net.biases[1][2] = 9;
      net.biases[2][0] = 10;
      net.adjustWeights();
      const result = praxis.run(layer1);
      expect(result[0][0]).not.toBe(0);
      expect(result[0][0]).toBe(net.biases[1][0]);
      expect(result[1][0]).not.toBe(0);
      expect(result[1][0]).toBe(net.biases[1][1]);
      expect(result[2][0]).not.toBe(0);
      expect(result[2][0]).toBe(net.biases[1][2]);
    });
  });
});
