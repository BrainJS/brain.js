'use strict';

import assert from 'assert';
import { predict, learn } from '../../src/layer/leaky-relu';

describe('Leaky Relu Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can leaky relu a simple matrix', () => {
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
        [.1, -.002, .3],
        [-.004, .5, -.006],
        [.7, -.008, .9]
      ]);
    });
  });

  describe('.learn (back propagation)', () => {
    it('can leaky relu a simple matrix', () => {
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
        [ 1, .01, 1 ],
        [ .01, 1, .01 ],
        [ 1, .01, 1 ]
      ]);
    });
  });
});