import assert from 'assert';
import gpuMock from 'gpu-mock.js';
import { predict, compareX, compareY } from '../../src/layer/multiply';

describe('Multiply Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can multiply a simple matrix', () => {
      const inputs1 = [
        [1, 2, 3],
        [4, 5, 6]
      ];
      const inputs2 = [
        [7, 8],
        [9, 10],
        [11, 12]
      ];
      const results = gpuMock(predict, {
        output: [2, 2],
        constants: {
          size: inputs2.length,
        }
      })(inputs1, inputs2);

      assert.deepEqual(results, [[58, 139], [64, 154]]);
    });
  });
  describe('.compare (back propagation)', () => {
    it('can multiply a simple matrix', () => {
      const nextDeltas = [
        [1, 2],
        [3, 4]
      ];
      const weights0 = [
        [1, 2, 3],
        [4, 5, 6]
      ];
      const deltas0 = [
        [0, 0, 0],
        [0, 0, 0]
      ];
      const newDeltas0 = [
        [23, 29, 35],
        [53, 67, 81]
      ];
      const weights1 = [
        [7, 8],
        [9, 10],
        [11, 12]
      ];
      const deltas1 = [
        [0, 0],
        [0, 0],
        [0, 0]
      ];
      const newDeltas1 = [
        [13, 18],
        [17, 24],
        [21, 30]
      ];

      const results0 = gpuMock(compareX, {
        output: [3, 2],
        constants: {
          size: nextDeltas.length
        }
      })(nextDeltas, deltas0, weights1);

      assert.deepEqual(results0, newDeltas0);

      const results1 = gpuMock(compareY, {
        output: [2, 3],
        constants: {
          size: nextDeltas.length
        }
      })(nextDeltas, deltas1, weights0);

      assert.deepEqual(results1, newDeltas1);
    });
  });
});