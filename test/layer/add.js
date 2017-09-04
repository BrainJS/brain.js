'use strict';

import assert from 'assert';
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
      const context = {
        thread: {
          x: 0,
          y: 0
        }
      };
      const result = [];

      for (let y = 0; y < input1.length; y++) {
        const row = [];
        for (let x = 0; x < input1[y].length; x++) {
          context.thread.x = x;
          context.thread.y = y;
          const result = predict.call(context, input1, input2);
          row.push(result);
        }
        result.push(row);
      }

      assert.deepEqual(result, [[2, 4, 6], [8, 10, 12], [14, 16, 18]]);
    });
  });
});