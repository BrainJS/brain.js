'use strict';

import assert from 'assert';
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

      assert.deepEqual(result, [[30, 36, 42], [66, 81, 96], [102, 126, 150]]);
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