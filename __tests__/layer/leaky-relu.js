import gpuMock from 'gpu-mock.js';
import { predict, compare } from '../../src/layer/leaky-relu';

describe('Leaky Relu Layer', () => {
  describe('.predict (forward propagation)', () => {
    test('can leaky relu a simple matrix', () => {
      const inputs = [[0.1, -0.2, 0.3], [-0.4, 0.5, -0.6], [0.7, -0.8, 0.9]];
      const results = gpuMock(predict, {
        output: [3, 3],
      })(inputs);

      expect(results).toEqual([
        [0.1, -0.002, 0.3],
        [-0.004, 0.5, -0.006],
        [0.7, -0.008, 0.9],
      ]);
    });
  });

  describe('.compare (back propagation)', () => {
    test('can leaky relu a simple matrix', () => {
      const inputs = [[0.1, -0.2, 0.3], [-0.4, 0.5, -0.6], [0.7, -0.8, 0.9]];
      const deltas = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
      const results = gpuMock(compare, {
        output: [3, 3],
      })(inputs, deltas);

      expect(results).toEqual([[1, 0.01, 1], [0.01, 1, 0.01], [1, 0.01, 1]]);
    });
  });
});
