'use strict';

import assert from 'assert';
import gpuMock from 'gpu-mock.js';
import { predict, learn } from '../../src/layer/tanh';

describe('Tanh Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can tanh a simple matrix', () => {
      const inputs = [
        [.1, .2, .3],
        [.4, .5, .6],
        [.7, .8, .9]
      ];
      const results = gpuMock(predict, { output: [3,3] })(inputs);

      assert.deepEqual(shave(results), shave([
        [0.0996679946249559, 0.19737532022490412, 0.291312612451591],
        [0.37994896225522495, 0.4621171572600098, 0.5370495669980353],
        [0.6043677771171635, 0.664036770267849, 0.7162978701990244]
      ]));
    });
  });

  describe('.learn (back propagation)', () => {
    it('can tanh a simple matrix', () => {
      const inputs = [
        [.1, .2, .3],
        [.4, .5, .6],
        [.7, .8, .9]
      ];
      const deltas = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
      ];
      const results = gpuMock(learn, { output: [3,3] })(inputs, deltas);

      assert.deepEqual(shave(results), shave([
        [ 0.99, 0.96, 0.91 ],
        [ 0.84, 0.75, 0.64 ],
        [ 0.51, 0.3599999999999999, 0.18999999999999995 ]
      ]));
    });
  });
});


function shave(array) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    if (Array.isArray(array[i])) {
      result.push(shave(array[i]));
    } else {
      result.push(array[i].toFixed(16));
    }
  }
}