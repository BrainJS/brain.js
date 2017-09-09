'use strict';

import assert from 'assert';
import gpuMock from 'gpu-mock.js';
import { predict, learn } from '../../src/layer/leaky-relu';

describe('Leaky Relu Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can leaky relu a simple matrix', () => {
      const input = [
        [.1, -.2, .3],
        [-.4, .5, -.6],
        [.7, -.8, .9]
      ];
      const result = gpuMock(predict, {
        output: [3,3]
      })(input);

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
      const result = gpuMock(learn, {
        output: [3,3]
      })(input, delta);
      assert.deepEqual(result, [
        [ 1, .01, 1 ],
        [ .01, 1, .01 ],
        [ 1, .01, 1 ]
      ]);
    });
  });
});