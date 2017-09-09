'use strict';

import assert from 'assert';
import gpuMock from 'gpu-mock.js';
import { predict, learn } from '../../src/layer/multiply';

describe('Multiply Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can multiply a simple matrix', () => {
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
        output: [3,3]
      })(input1, input2);

      assert.deepEqual(result, [
        [30, 36, 42],
        [66, 81, 96],
        [102, 126, 150]
      ]);
    });
  });

  describe('.learn (back propagation)', () => {
    it('can multiply a simple matrix', () => {
      const input = [
        [30, 36, 42],
        [66, 81, 96],
        [102, 126, 150]
      ];
      const delta = [[1, 1, 1],[1, 1, 1],[1, 1, 1]];
      const result = gpuMock(learn, { output: [3,3] })(input, delta);

      assert.deepEqual(result, [
        [108, 108, 108],
        [243, 243, 243],
        [378, 378, 378]
      ]);
    });
  });
});