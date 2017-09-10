'use strict';

import assert from 'assert';
import gpuMock from 'gpu-mock.js';
import { predict } from '../../src/layer/add';

describe('Add Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can add a simple matrix', () => {
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
        output: [3, 3]
      })(inputs1, inputs2);

      assert.deepEqual(results, [[2, 4, 6], [8, 10, 12], [14, 16, 18]]);
    });
  });
});