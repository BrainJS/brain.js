'use strict';

import assert from 'assert';
import { predict, learn } from '../../src/layer/tanh';

describe('Tanh Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can tanh a simple matrix', () => {
      const input = [
        [.1, .2, .3],
        [.4, .5, .6],
        [.7, .8, .9]
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
        [0.0996679946249559, 0.19737532022490412, 0.291312612451591],
        [0.37994896225522495, 0.4621171572600098, 0.5370495669980353],
        [0.6043677771171635, 0.664036770267849, 0.7162978701990244]
      ]);
    });
  });

  describe('.learn (back propagation)', () => {
    it('can tanh a simple matrix', () => {
      const input = [
        [.1, .2, .3],
        [.4, .5, .6],
        [.7, .8, .9]
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
        [ 0.99, 0.96, 0.91 ],
        [ 0.84, 0.75, 0.64 ],
        [ 0.51, 0.3599999999999999, 0.18999999999999995 ]
      ]);
    });
  });
});