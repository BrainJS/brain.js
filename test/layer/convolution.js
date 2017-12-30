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
      const results = gpuMock(predict, {
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

      assert.deepEqual(results, [
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
      const results = gpuMock(learnFilters, {
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
      assert.deepEqual(results, [
        [45, 33, 18],
        [39, 28, 15],
        [24, 17, 9]
      ]);
    });
  });

  describe('.learnInputs (back propagation)', () => {
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
      const results = gpuMock(learnInputs, {
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
      })(inputs, deltas);

      assert.deepEqual(results, [
        [1,4,10],
        [8, 26, 56],
        [30, 84, 165]
      ]);
    });
  });
});