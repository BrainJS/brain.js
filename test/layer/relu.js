'use strict';

import assert from 'assert';
import { predict, learn } from '../../src/layer/relu';

describe('Relu Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can relu a simple matrix', () => {
      const input = [
        [.1, -.2, .3],
        [-.4, .5, -.6],
        [.7, -.8, .9]
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

      for (let y = 0; y < input.length; y++) {
        const row = [];
        for (let x = 0; x < input[y].length; x++) {
          context.thread.x = x;
          context.thread.y = y;
          const result = predict.call(context, input);
          row.push(result);
        }
        result.push(row);
      }

      assert.deepEqual(result, [
        [.1, 0, .3],
        [0, .5, 0],
        [.7, 0, .9]
      ]);
    });
  });

  describe('.learn (back propagation)', () => {
    it('can relu a simple matrix', () => {
      const input = [
        [.1, -.2, .3],
        [-.4, .5, -.6],
        [.7, -.8, .9]
      ];
      const delta = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
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

      assert.deepEqual(result, [
        [ 1, 0, 1 ],
        [ 0, 1, 0 ],
        [ 1, 0, 1 ]
      ]);
    });
  });
});