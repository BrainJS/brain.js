'use strict';

import assert from 'assert';
import gpuMock from 'gpu-mock.js';
import { predict, learnFilters, learnInputs } from '../../src/layer/convolution';

describe('Convolution Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can convolution a simple matrix', () => {
      const inputs = [[
        [1,2,3],
        [4,5,6],
        [7,8,9]
      ]];
      const filters = [[
        [1,2,3],
        [4,5,6],
        [7,8,9]
      ]];
      const biases = [1,2,3];
      const result = gpuMock(predict, {
        output: [3,3],
        constants: {
          strideX: 1,
          strideY: 1,
          paddingY: 0,
          paddingX: 0,
          filterHeight: 3,
          filterWidth: 3,
          filterCount: 1,
          inputWidth: 3,
          inputHeight: 3,
          inputDepth: 1
        }
      })(filters, inputs, biases);

      assert.deepEqual(result, [
        [286,187,91],
        [155, 95, 43],
        [51, 27, 10]
      ]);
    });
  });

  describe('.learnFilters (back propagation)', () => {
    it('can convolution a simple matrix', () => {
      const inputs = [[
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]];
      const deltas = [[
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]];
      const result = gpuMock(learnFilters, {
        output: [3, 3],
        constants: {
          strideX: 1,
          strideY: 1,
          paddingY: 0,
          paddingX: 0,
          filterHeight: 3,
          filterWidth: 3,
          filterCount: 1,
          inputWidth: 3,
          inputHeight: 3,
          inputDepth: 1
        }
      })(inputs, deltas);

      //TODO: likely incorrect
      assert.deepEqual(result, [
        [45, 33, 18],
        [39, 28, 15],
        [24, 17, 9]
      ]);
    });
  });

  describe('.learnInputs (back propagation)', () => {
    it('can convolution a simple matrix', () => {
      const input = [[
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]];
      const delta = [[
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]];
      const result = gpuMock(learnInputs, {
        output: [3,3],
        constants: {
          strideX: 1,
          strideY: 1,
          paddingY: 0,
          paddingX: 0,
          filterHeight: 3,
          filterWidth: 3,
          filterCount: 1,
          inputWidth: 3,
          inputHeight: 3,
          inputDepth: 1
        }
      })(input, delta);

      assert.deepEqual(result, [
        [1,4,10],
        [8, 26, 56],
        [30, 84, 165]
      ]);
    });
  });
});