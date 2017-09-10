'use strict';

import assert from 'assert';
import gpuMock from 'gpu-mock.js';
import { predict, learn } from '../../src/layer/multiply';

describe('Multiply Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can multiply a simple matrix', () => {
      const inputs1 = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ];
      const inputs2 = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ];
      const results = gpuMock(predict, {
        output: [3,3]
      })(inputs1, inputs2);

      assert.deepEqual(results, [
        [30, 36, 42],
        [66, 81, 96],
        [102, 126, 150]
      ]);
    });
  });

  describe('.learn (back propagation)', () => {
    it('can multiply a simple matrix', () => {
      const inputs = [
        [30, 36, 42],
        [66, 81, 96],
        [102, 126, 150]
      ];
      const deltas = [[1, 1, 1],[1, 1, 1],[1, 1, 1]];
      const results = gpuMock(learn, { output: [3,3] })(inputs, deltas);

      assert.deepEqual(results, [
        [108, 108, 108],
        [243, 243, 243],
        [378, 378, 378]
      ]);
    });
  });
});