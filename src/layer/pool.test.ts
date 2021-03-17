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
        [1, 0],
        [1, 0],
      ];
      const switchY = [
        [1, 1],
        [0, 0],
      ];
      const constants: ICompareConstants = {
        inputWidth: 2,
        inputHeight: 2,

        outputWidth: 2,
        outputHeight: 2,
      };
      const results = gpuMock(compare, {
        output: [2, 2],
        constants,
      })(deltas, switchY, switchX);

      expect(results).toEqual([
        new Float32Array([4, 3]),
        new Float32Array([2, 1]),
      ]);
    });
    test('can pool a simple matrix', () => {
      const deltas = [
        [1, 2],
        [3, 4],
      ];
      const switchX = [
        [1, 1],
        [1, 1],
      ];
      const switchY = [
        [1, 1],
        [1, 1],
      ];
      const constants: ICompareConstants = {
        inputWidth: 2,
        inputHeight: 2,

        outputWidth: 2,
        outputHeight: 2,
      };
      const results = gpuMock(compare, {
        output: [2, 2],
        constants,
      })(deltas, switchY, switchX);

      expect(results).toEqual([
        new Float32Array([0, 0]),
        new Float32Array([0, 10]),
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
          [1, 0],
          [1, 0],
        ],
      ];
      const switchY = [
        [
          [1, 1],
          [0, 0],
        ],
      ];
      const constants: ICompareConstants = {
        inputWidth: 2,
        inputHeight: 2,

        outputWidth: 2,
        outputHeight: 2,
      };
      const results = gpuMock(compare3D, {
        output: [2, 2, 1],
        constants,
      })(deltas, switchY, switchX);

      expect(results).toEqual([
        [new Float32Array([4, 3]), new Float32Array([2, 1])],
      ]);
    });
    test('can pool a simple matrix', () => {
      const deltas = [
        [
          [1, 2],
          [3, 4],
        ],
      ];
      const switchX = [
        [
          [1, 1],
          [1, 1],
        ],
      ];
      const switchY = [
        [
          [1, 1],
          [1, 1],
        ],
      ];
      const constants: ICompareConstants = {
        inputWidth: 2,
        inputHeight: 2,

        outputWidth: 2,
        outputHeight: 2,
      };
      const results = gpuMock(compare3D, {
        output: [2, 2, 1],
        constants,
      })(deltas, switchY, switchX);

      expect(results).toEqual([
        [new Float32Array([0, 0]), new Float32Array([0, 10])],
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
    it.skip('can compare pool a simple matrix', () => {
      const deltas = [[9]];
      const switchX = [[0]];
      const switchY = [[0]];
      const constants: ICompareConstants = {
        inputWidth: 3,
        inputHeight: 3,

        outputWidth: 1,
        outputHeight: 1,
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
