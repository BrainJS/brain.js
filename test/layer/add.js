'use strict';

import assert from 'assert';
import gpuMock from 'gpu-mock.js';
import { predict } from '../../src/layer/add';

describe('Add Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can add a simple matrix', () => {
      const input1 = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ];
      const input2 = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ];
      const result = gpuMock(predict, {
        output: [3, 3]
      })(input1, input2);

      assert.deepEqual(result, [[2, 4, 6], [8, 10, 12], [14, 16, 18]]);
    });
  });
});