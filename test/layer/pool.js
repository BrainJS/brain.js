'use strict';

import assert from 'assert';
import gpuMock from 'gpu-mock.js';
import { predict, learn } from '../../src/layer/pool';

describe('Pool Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can pool a simple matrix', () => {
      const inputs = [[
        [1,2,3],
        [4,5,6],
        [7,8,9]
      ]];
      const results = gpuMock(predict, {
        output: [1,1,0],
        constants: {
          strideX: 1,
          strideY: 1,
          inputWidth: 3,
          inputHeight: 3,
          inputDepth: 1,
          paddingX: 0,
          paddingY: 0,
          filterWidth: 3,
          filterHeight: 3,
          filterCount: 1
        }
      })(inputs);

      assert.deepEqual(results, [
        [9]
      ]);
    });
  });

  describe('.learn (back propagation)', () => {
    it('can pool a simple matrix', () => {
      const deltas = [[9]];
      const switchX = [[0]];
      const switchY = [[0]];
      const results = gpuMock(learn, {
        output: [3,3,0],
        constants: {
          strideX: 1,
          strideY: 1,
          inputWidth: 3,
          inputHeight: 3,
          inputDepth: 1,
          outputWidth: 1,
          outputHeight: 1,
          paddingX: 0,
          paddingY: 0,
          filterWidth: 3,
          filterHeight: 3,
          filterCount: 1
        }
      })(deltas, switchX, switchY);

      assert.deepEqual(results, [
        [9,0,0],
        [0,0,0],
        [0,0,0]
      ]);
    });
  });
});