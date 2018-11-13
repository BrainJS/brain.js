import gpuMock from 'gpu-mock.js';
import {
  predict,
  compareFilterDeltas,
  compareInputDeltas,
  compareBiases,
} from '../../src/layer/convolution';
import { onePlusPlus3D } from '../test-utils';

describe('Convolution Layer', () => {
  describe('.predict (forward propagation)', () => {
    test('can convolution a simple matrix', () => {
      const inputs = [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]];
      const filters = [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]];
      const biases = [1, 2, 3];

      const results = gpuMock(predict, {
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
          inputDepth: 1,
        },
      })(filters, inputs, biases);

      expect(results).toEqual([[286, 187, 91], [155, 95, 43], [51, 27, 10]]);
    });
  });

  describe('.compareFilterDeltas (back propagation)', () => {
    test('can convolution a simple matrix', () => {
      const filterWidth = 2;
      const filterHeight = 2;
      const inputWidth = 4;
      const inputHeight = 4;
      const inputDepth = 1;
      const width = 2;
      const height = 2;
      const depth = 1;
      const stride = 1;
      const padding = 0;

      const filterDeltas = onePlusPlus3D(filterWidth, filterHeight, inputDepth);
      const inputs = onePlusPlus3D(inputWidth, inputHeight, inputDepth);
      const deltas = onePlusPlus3D(width, height, depth);
      const results = gpuMock(compareFilterDeltas, {
        output: [filterWidth, filterHeight, 1],
        constants: {
          strideX: stride,
          strideY: stride,
          paddingY: padding,
          paddingX: padding,
          filterWidth,
          filterHeight,
          inputWidth,
          inputHeight,
          deltaZ: 0,
          deltaWidth: width,
          deltaHeight: height,
        },
      })(filterDeltas, inputs, deltas);

      expect(results).toEqual([[[45, 56], [87, 98]]]);
    });
  });

  describe('.compareInputDeltas (back propagation)', () => {
    test('can convolution a simple matrix', () => {
      const inputDeltas = [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]];
      const filters = [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]];
      const deltas = [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]];
      const results = gpuMock(compareInputDeltas, {
        output: [3, 3],
        constants: {
          strideX: 1,
          strideY: 1,
          paddingY: 0,
          paddingX: 0,
          filterHeight: 3,
          filterWidth: 3,
          filterCount: 1,
          deltaWidth: 3,
          deltaHeight: 3,
          deltaDepth: 1,
          deltaZ: 0
        },
      })(inputDeltas, filters, deltas);

      expect(results).toEqual([[2, 6, 13], [12, 31, 62], [37, 92, 174]]);
    });
  });

  describe('.compareBiases (back propagation)', () => {
    const deltas = [
      [[0, 16], [8, 24]],
      [[1, 17], [9, 25]],
      [[2, 18], [10, 26]],
      [[3, 19], [11, 27]],
      [[4, 20], [12, 28]],
      [[5, 21], [13, 29]],
      [[6, 22], [14, 30]],
      [[7, 23], [15, 31]],
    ];
    test('accumulates values from deltas correctly from 0', () => {
      const biasDeltas = [[[0]], [[0]], [[0]], [[0]], [[0]], [[0]], [[0]], [[0]]];
      const kernel = gpuMock(compareBiases, {
        output: [1, 1, 8],
        constants: {
          deltaWidth: 2,
          deltaHeight: 2,
        },
      });
      const result = kernel(biasDeltas, deltas);
      const expectedBiasDeltas = [
        [[48]],
        [[52]],
        [[56]],
        [[60]],
        [[64]],
        [[68]],
        [[72]],
        [[76]],
      ];

      expect(result).toEqual(expectedBiasDeltas);
    });
    test('accumulates values from deltas correctly from greater than 0', () => {
      const biasDeltas = [[[0]], [[1]], [[2]], [[3]], [[4]], [[5]], [[6]], [[7]]];
      const kernel = gpuMock(compareBiases, {
        output: [1, 1, 8],
        constants: {
          deltaWidth: 2,
          deltaHeight: 2,
        },
      });
      const result = kernel(biasDeltas, deltas);
      const expectedBiasDeltas = [
        [[48]],
        [[53]],
        [[58]],
        [[63]],
        [[68]],
        [[73]],
        [[78]],
        [[83]],
      ];

      expect(result).toEqual(expectedBiasDeltas);
    });
  });
});
