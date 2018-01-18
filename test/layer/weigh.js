import assert from 'assert';
import gpuMock from 'gpu-mock.js';
import { predict, compare } from '../../src/layer/weigh';

describe('Weigh Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can weigh a simple matrix', () => {
      const weights = [
        [0, 1, 2, 3],
        [1, 2, 3, 0],
        [2, 3, 0, 1],
        [3, 0, 1, 2]
      ];
      const inputs = [
        [3, 3, 1, 0]
      ];

      const results = gpuMock(predict, {
        output: [4, 1],
        constants: {
          size: 4
        }
      })(weights, inputs);

      assert.deepEqual(results, [[5, 12, 15, 10]]);
    });
  });
  describe('.compare (back propagation)', () => {
    it('can compare a simple matrix', () => {
      const weights = [
        [0, 1, 2, 3],
        [1, 2, 3, 0],
        [2, 3, 0, 1],
        [3, 0, 1, 2]
      ];
      const deltas = [
        [1, 2, 3, 4]
      ];

      const results = gpuMock(compare, {
        output: [4, 1],
        constants: {
          size: 4
        }
      })(deltas, weights);

      assert.deepEqual(results, [[20, 14, 12, 14]]);
    });
  });
});