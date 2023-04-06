import { GPU } from 'gpu.js';
import { gpuMock } from 'gpu-mock.js';
import {
  Pool,
  predict,
  compare,
  compare3D,
  ICompareConstants,
  IPredictConstants,
} from './pool';
import { setup, teardown } from '../utilities/kernel';
import { mockLayer } from '../test-utils';

describe('Pool Layer', () => {
  beforeEach(() => {
    setup(
      new GPU({
        mode: 'cpu',
      })
    );
  });
  afterEach(() => {
    teardown();
  });
  describe('constructor', () => {
    test('correctly sets dimensions', () => {
      const layer = new Pool(
        {
          filterWidth: 2,
          filterHeight: 2,
          filterCount: 8,
          stride: 2,
        },
        mockLayer({
          width: 24,
          height: 24,
        })
      );
      expect(layer.width).toEqual(12);
      expect(layer.height).toEqual(12);
      expect(layer.depth).toEqual(8);
    });
  });
  describe('.predict (forward propagation)', () => {
    test('can pool a simple matrix', () => {
      const inputs = [
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ],
      ];
      const constants: IPredictConstants = {
        filterWidth: 3,
        filterHeight: 3,
        filterCount: 1,

        inputWidth: 3,
        inputHeight: 3,
        inputDepth: 1,

        paddingX: 0,
        paddingY: 0,

        strideX: 1,
        strideY: 1,
      };
      const results = gpuMock(predict, {
        output: [1, 1, 0],
        constants,
      })(inputs);

      expect(results).toEqual([new Float32Array([9])]);
    });
  });
  describe('.compare (back propagation)', () => {
    test('can pool a simple matrix', () => {
      const deltas = [
        [1, 2],
        [3, 4],
      ];
      const switchX = [
        [0, 2],
        [1, 1],
      ];
      const switchY = [
        [1, 1],
        [2, 2],
      ];

      const constants: ICompareConstants = {
        inputWidth: 2,
        inputHeight: 2,

        outputWidth: 2,
        outputHeight: 2,

        paddingX: 0,
        paddingY: 0,
        strideX: 1,
        strideY: 1,
        filterWidth: 2,
        filterHeight: 2,
      };
      const results = gpuMock(compare, {
        output: [3, 3],
        constants,
      })(deltas, switchX, switchY);
      expect(results).toEqual([
        new Float32Array([0, 0, 0]),
        new Float32Array([1, 0, 2]),
        new Float32Array([0, 7, 0]),
      ]);
    });
    test('can pool a simple matrix 2', () => {
      // Tests backprop of 2x2 matrix with 1 padding, resulting in 3x3
      const deltas = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const switchX = [
        [0, 1, 1],
        [0, 0, 1],
        [0, 1, 1],
      ];
      const switchY = [
        [0, 0, 0],
        [0, 1, 0],
        [1, 1, 1],
      ];
      const constants: ICompareConstants = {
        inputWidth: 2,
        inputHeight: 2,

        outputWidth: 3,
        outputHeight: 3,

        paddingX: 1,
        paddingY: 1,
        strideX: 1,
        strideY: 1,
        filterWidth: 2,
        filterHeight: 2,
      };
      const results = gpuMock(compare, {
        output: [2, 2],
        constants,
      })(deltas, switchX, switchY);

      expect(results).toEqual([
        new Float32Array([5, 11]),
        new Float32Array([12, 17]),
      ]);
    });
  });
  describe('.compare3D (back propagation)', () => {
    test('can pool a simple matrix', () => {
      const deltas = [
        [
          [1, 2],
          [3, 4],
        ],
      ];
      const switchX = [
        [
          [0, 2],
          [1, 2],
        ],
      ];
      const switchY = [
        [
          [0, 1],
          [2, 2],
        ],
      ];
      const constants: ICompareConstants = {
        inputWidth: 2,
        inputHeight: 2,

        outputWidth: 2,
        outputHeight: 2,

        paddingX: 0,
        paddingY: 0,
        strideX: 1,
        strideY: 1,
        filterWidth: 2,
        filterHeight: 2,
      };
      const results = gpuMock(compare3D, {
        output: [3, 3, 1],
        constants,
      })(deltas, switchY, switchX);

      expect(results).toEqual([
        [
          new Float32Array([1, 0, 0]),
          new Float32Array([0, 0, 2]),
          new Float32Array([0, 3, 4]),
        ],
      ]);
    });
    test('can pool a simple matrix 2', () => {
      const deltas = [
        [
          [1, 2],
          [3, 4],
        ],
      ];
      const switchX = [
        [
          [0, 1],
          [0, 1],
        ],
      ];
      const switchY = [
        [
          [0, 0],
          [1, 1],
        ],
      ];
      const constants: ICompareConstants = {
        inputWidth: 2,
        inputHeight: 2,

        outputWidth: 2,
        outputHeight: 2,

        paddingX: 1,
        paddingY: 1,
        strideX: 1,
        strideY: 1,
        filterWidth: 2,
        filterHeight: 2,
      };
      const results = gpuMock(compare3D, {
        output: [2, 2, 1],
        constants,
      })(deltas, switchY, switchX);

      expect(results).toEqual([
        [new Float32Array([1, 2]), new Float32Array([3, 4])],
      ]);
    });
  });
});

describe('Pool Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can predict pool a simple matrix', () => {
      const inputs = [
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ],
      ];
      const constants: IPredictConstants = {
        filterWidth: 3,
        filterHeight: 3,
        filterCount: 1,

        inputWidth: 3,
        inputHeight: 3,
        inputDepth: 1,

        paddingX: 0,
        paddingY: 0,

        strideX: 1,
        strideY: 1,
      };
      const results = gpuMock(predict, {
        output: [1, 1, 0],
        constants,
      })(inputs);

      expect(results).toEqual([Float32Array.from([9])]);
    });
  });

  describe('.compare (back propagation)', () => {
    it('can compare pool a simple matrix', () => {
      const deltas = [[9]];
      const switchX = [[0]];
      const switchY = [[0]];
      const constants: ICompareConstants = {
        inputWidth: 3,
        inputHeight: 3,

        outputWidth: 1,
        outputHeight: 1,

        paddingX: 0,
        paddingY: 0,
        strideX: 1,
        strideY: 1,
        filterWidth: 3,
        filterHeight: 3,
      };
      const results = gpuMock(compare, {
        output: [3, 3, 0],
        constants,
      })(deltas, switchX, switchY);
      expect(results).toEqual([
        Float32Array.from([9, 0, 0]),
        Float32Array.from([0, 0, 0]),
        Float32Array.from([0, 0, 0]),
      ]);
    });
  });
});
