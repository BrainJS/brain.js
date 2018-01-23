import assert from 'assert';
import gpuMock from 'gpu-mock.js';
import { predict, compareFromX, compareFromY } from '../../src/layer/multiply';

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

      assert.deepEqual(results, [
        [58, 64],
        [139, 154]
      ]);
    });
  });
  describe('.compareFromX (back propagation)', () => {
    it('can multiply a simple matrix', () => {
      const m1 = [
        [3, 3],
        [3, 3]
      ];
      const m2 = [
        [3, 3],
        [3, 3]
      ];
      const deltas = [
        [3, 3],
        [3, 3]
      ];
      const result = gpuMock(compareFromX, {
        output: [2, 2],
        constants: {
          size: 2
        }
      })(deltas, m1, m2);
      assert.deepEqual(result, [[21, 21], [21, 21]]);
    });
  });
  describe('.compareFromY (back propagation)', () => {
    it('can multiply a simple matrix', () => {
      const m1 = [
        [3, 3],
        [3, 3]
      ];
      const m2 = [
        [3, 3],
        [3, 3]
      ];
      const deltas = [
        [3, 3],
        [3, 3]
      ];
      const result = gpuMock(compareFromY, {
        output: [2, 2],
        constants: {
          size: 2
        }
      })(deltas, m1, m2);
      assert.deepEqual(result, [[21, 21], [21, 21]]);
    });
  });
});