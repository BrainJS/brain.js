'use strict';

import assert from 'assert';
import gpuMock from 'gpu-mock.js';
import { predict } from '../../src/layer/add';

describe('Dropout Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can dropout a simple matrix', () => {
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
  describe('.learn (back propagation)', () => {
    it('can dropout a simple matrix', () => {
      const input = [
        [30, 36, 42],
        [66, 81, 96],
        [102, 126, 150]
      ];
      const delta = [[1, 1, 1],[1, 1, 1],[1, 1, 1]];
      const context = {
        thread: {
          x: 0,
          y: 0
        },
        output: {
          x: 3,
          y: 3
        }
      };
      const result = [];

      for (let y = 0; y < input.length; y++) {
        const row = [];
        for (let x = 0; x < input[y].length; x++) {
          context.thread.x = x;
          context.thread.y = y;
          const result = learn.call(context, input, delta);
          row.push(result);
        }
        result.push(row);
      }

      assert.deepEqual(result, [ [ 108, 108, 108 ], [ 243, 243, 243 ], [ 378, 378, 378 ] ] );
    });
  });
});