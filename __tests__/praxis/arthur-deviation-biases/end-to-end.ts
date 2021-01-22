/* istanbul ignore file */
import { GPU } from 'gpu.js';
import { ArthurDeviationBiases } from '../../../src/praxis/arthur-deviation-biases';
import { random } from '../../../src/layer/random';
import { NeuralNetwork } from '../../../src/neural-network';
import { setup, teardown } from '../../../src/utilities/kernel';

describe('ArthurDeviationBiases', () => {
  beforeEach(() => {
    setup(
      new GPU({
        mode: 'cpu',
      })
    );
  });
  afterEach(() => {
    teardown();
  });
  describe('.run()', () => {
    test('correctly runs values', () => {
      const layer: any = { weights: [[1]], deltas: [[1]], width: 1, height: 1 };
      const praxis = new ArthurDeviationBiases(layer);
      praxis.setupKernels();
      const result: any = praxis.run(layer);
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
      const layer1 = random({ id: 'biases', height: 3 });
      const praxis = new ArthurDeviationBiases(layer1, {
        learningRate: net.trainOpts.learningRate,
      });
      expect(praxis.settings.learningRate).toBe(
        net.trainOpts.learningRate
      );

      net.deltas[0][0] = 1;
      net.deltas[0][1] = 2;

      (layer1.deltas as number[][])[0][0] = (net.deltas as any)[1][0] = 3;
      (layer1.deltas as number[][])[1][0] = (net.deltas as any)[1][1] = 4;
      (layer1.deltas as number[][])[2][0] = (net.deltas as any)[1][2] = 5;

      (net.deltas as any)[2][0] = 6;

      (layer1.weights as number[][])[0][0] = (net.biases as any)[1][0] = 7;
      (layer1.weights as number[][])[1][0] = (net.biases as any)[1][1] = 8;
      (layer1.weights as number[][])[2][0] = (net.biases as any)[1][2] = 9;
      (net.biases as any)[2][0] = 10;
      net.adjustWeights();
      praxis.setupKernels();
      const result = praxis.run(layer1) as number[][];
      expect(result[0][0]).not.toBe(0);
      expect(result[0][0]).toBe((net.biases as any)[1][0]);
      expect(result[1][0]).not.toBe(0);
      expect(result[1][0]).toBe((net.biases as any)[1][1]);
      expect(result[2][0]).not.toBe(0);
      expect(result[2][0]).toBe((net.biases as any)[1][2]);
    });
  });
});
