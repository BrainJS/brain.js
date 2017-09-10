'use strict';

import assert from 'assert';
import gpuMock from 'gpu-mock.js';
import { predict, learn } from '../../src/layer/leaky-relu';

describe('Leaky Relu Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can leaky relu a simple matrix', () => {
      const inputs = [
        [.1, -.2, .3],
        [-.4, .5, -.6],
        [.7, -.8, .9]
      ];
      const results = gpuMock(predict, {
        output: [3,3]
      })(inputs);

      assert.deepEqual(results, [
        [.1, -.002, .3],
        [-.004, .5, -.006],
        [.7, -.008, .9]
      ]);
    });
  });

  describe('.learn (back propagation)', () => {
    it('can leaky relu a simple matrix', () => {
      const inputs = [
        [.1, -.2, .3],
        [-.4, .5, -.6],
        [.7, -.8, .9]
      ];
      const deltas = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
      ];
      const results = gpuMock(learn, {
        output: [3,3]
      })(inputs, deltas);
      assert.deepEqual(results, [
        [ 1, .01, 1 ],
        [ .01, 1, .01 ],
        [ 1, .01, 1 ]
      ]);
    });
  });
});