'use strict';

import assert from 'assert';
import gpuMock from 'gpu-mock.js';
import { predict } from '../../src/layer/weigh';

describe('Weigh Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can weigh a simple matrix', () => {
      const inputs1 = [
        [0, 1, 2, 3]
      ];
      const inputs2 = [
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3]
      ];

      const results = gpuMock(predict, {
        output: [2, 1],
        constants: {
          inputWidth: 4
        }
      })(inputs1, inputs2);

      assert.deepEqual(results, [[14, 14]]);
    });
  });
});