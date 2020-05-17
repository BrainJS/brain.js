const { GPU } = require('gpu.js');
const { gpuMock } = require('gpu-mock.js');

const {
  predict,
  predict3D,
  compareBiases,
  compareFilterDeltas,
  compareFilterDeltas3D,
  compareInputDeltas,
  compareInputDeltas3D,
} = require('../../src/layer/fully-connected');
const { onePlusPlus2D, zero2D } = require('../test-utils');
const { setup, teardown } = require('../../src/utilities/kernel');
const { injectIstanbulCoverage } = require('../test-utils');

describe('FullyConnected Layer', () => {
  beforeEach(() => {
    setup(
      new GPU({
        mode: 'cpu',
        onIstanbulCoverageVariable: injectIstanbulCoverage,
      })
    );
  });
  afterEach(() => {
    teardown();
  });
  describe('.predict (forward propagation)', () => {
    test('can predict a simple matrix', () => {
      const weights = [
        [1, 2],
        [3, 4],
      ];
      const filters = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ];
      const biases = [0.2, 0.2, 0.2, 0.2];
      const kernel = gpuMock(predict, {
        output: [4],
        constants: {
          inputDepth: 1,
          inputHeight: 2,
          inputWidth: 2,
        },
      });

      expect(kernel(weights, filters, biases)).toEqual(
        new Float32Array([30.2, 70.2, 110.2, 150.2])
      );
    });

    test('can predict a matrix', () => {
      const results = gpuMock(predict, {
        output: [9],
        constants: {
          inputDepth: 1,
          inputHeight: 1,
          inputWidth: 9,
        },
      })(
        [[0, 1, 2, 3, 4, 5, 6, 7, 8]],
        [
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
        ],
        [0, 1, 2, 3, 4, 5, 6, 7, 8]
      );

      expect(results).toEqual(
        new Float32Array([204, 205, 206, 207, 208, 209, 210, 211, 212])
      );
    });
  });

  describe('.predict3D (forward propagation)', () => {
    test('can predict a simple matrix', () => {
      const weights = [
        [
          [1, 2],
          [3, 4],
        ],
      ];
      const filters = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ];
      const biases = [0.2, 0.2, 0.2, 0.2];
      const kernel = gpuMock(predict3D, {
        output: [4, 1],
        constants: {
          inputDepth: 1,
          inputHeight: 2,
          inputWidth: 2,
        },
      });

      expect(kernel(weights, filters, biases)).toEqual([
        new Float32Array([30.2, 70.2, 110.2, 150.2]),
      ]);
    });

    test('can predict a matrix', () => {
      const results = gpuMock(predict3D, {
        output: [9, 1],
        constants: {
          inputDepth: 1,
          inputHeight: 1,
          inputWidth: 9,
        },
      })(
        [[[0, 1, 2, 3, 4, 5, 6, 7, 8]]],
        [
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
        ],
        [0, 1, 2, 3, 4, 5, 6, 7, 8]
      );

      expect(results).toEqual([
        new Float32Array([204, 205, 206, 207, 208, 209, 210, 211, 212]),
      ]);
    });
  });

  describe('.compareBiases (back propagation)', () => {
    test('can compare a simple matrix', () => {
      const biases = [0, 0, 0, 0];
      const deltas = [[1, 2, 3, 4]];
      const kernel = gpuMock(compareBiases, {
        output: [4],
        constants: {
          connectionCount: 4,
        },
      });

      expect(kernel(biases, deltas)).toEqual(new Float32Array([1, 2, 3, 4]));
    });

    test('can add a simple matrix', () => {
      const biases = [1, 2, 3, 4];
      const deltas = [[1, 2, 3, 4]];
      const kernel = gpuMock(compareBiases, {
        output: [4],
        constants: {
          connectionCount: 4,
        },
      });

      expect(kernel(biases, deltas)).toEqual(new Float32Array([2, 4, 6, 8]));
    });
  });

  describe('.compareFilterDeltas (back propagation)', () => {
    test('can compare a simple matrix', () => {
      const inputWeights = onePlusPlus2D(4, 4);
      const deltas = onePlusPlus2D(1, 16);
      const filterDeltas = zero2D(4, 4);
      const kernel = gpuMock(compareFilterDeltas, {
        output: [4, 4],
        constants: {
          deltaX: 0,
          deltaY: 0,
          deltaWidth: 4,
          deltaHeight: 4,
        },
      });

      expect(kernel(filterDeltas, inputWeights, deltas)).toEqual([
        new Float32Array([1, 2, 3, 4]),
        new Float32Array([5, 6, 7, 8]),
        new Float32Array([9, 10, 11, 12]),
        new Float32Array([13, 14, 15, 16]),
      ]);
    });

    test('can add a simple matrix', () => {
      const inputWeights = onePlusPlus2D(4, 4);
      const deltas = onePlusPlus2D(1, 16);
      const filterDeltas = onePlusPlus2D(4, 4);
      const kernel = gpuMock(compareFilterDeltas, {
        output: [4, 4],
        constants: {
          deltaX: 0,
          deltaY: 0,
          deltaWidth: 4,
          deltaHeight: 4,
        },
      });

      expect(kernel(filterDeltas, inputWeights, deltas)).toEqual([
        new Float32Array([2, 4, 6, 8]),
        new Float32Array([10, 12, 14, 16]),
        new Float32Array([18, 20, 22, 24]),
        new Float32Array([26, 28, 30, 32]),
      ]);
    });
  });

  describe('.compareFilterDeltas3D (back propagation)', () => {
    test('can compare a simplge matrix', () => {
      const inputWeights = [
        [
          [1, 2],
          [3, 4],
        ],
      ];
      const deltas = [[1, 2, 3, 4]];
      const filterDeltas = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      const kernel = gpuMock(compareFilterDeltas3D, {
        output: [4, 4],
        constants: {
          inputWidth: 2,
          inputHeight: 2,
        },
      });

      expect(kernel(filterDeltas, inputWeights, deltas)).toEqual([
        new Float32Array([1, 2, 3, 4]),
        new Float32Array([2, 4, 6, 8]),
        new Float32Array([3, 6, 9, 12]),
        new Float32Array([4, 8, 12, 16]),
      ]);
    });

    test('can add a simplge matrix', () => {
      const inputWeights = [
        [
          [1, 2],
          [3, 4],
        ],
      ];
      const deltas = [[1, 2, 3, 4]];
      const filterDeltas = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ];
      const kernel = gpuMock(compareFilterDeltas3D, {
        output: [4, 4],
        constants: {
          inputWidth: 2,
          inputHeight: 2,
        },
      });

      expect(kernel(filterDeltas, inputWeights, deltas)).toEqual([
        new Float32Array([2, 4, 6, 8]),
        new Float32Array([7, 10, 13, 16]),
        new Float32Array([12, 16, 20, 24]),
        new Float32Array([17, 22, 27, 32]),
      ]);
    });
  });
  describe('.compareInputDeltas (back propagation)', () => {
    test('can compare a simple matrix', () => {
      const inputDeltas = [
        [0, 0],
        [0, 0],
      ];
      const deltas = [[1, 2, 3, 4]];
      const filters = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ];
      const kernel = gpuMock(compareInputDeltas, {
        output: [2, 2],
        constants: {
          filterCount: 4,
        },
      });

      expect(kernel(inputDeltas, deltas, filters)).toEqual([
        new Float32Array([90, 100]),
        new Float32Array([110, 120]),
      ]);
    });

    test('can add a simple matrix', () => {
      const inputDeltas = [
        [1, 2],
        [3, 4],
      ];
      const deltas = [[1, 2, 3, 4]];
      const filters = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ];
      const kernel = gpuMock(compareInputDeltas, {
        output: [2, 2],
        constants: {
          filterCount: 4,
        },
      });

      expect(kernel(inputDeltas, deltas, filters)).toEqual([
        new Float32Array([91, 102]),
        new Float32Array([113, 124]),
      ]);
    });
  });
  describe('.compareInputDeltas3D (back propagation)', () => {
    test('can compare a simple matrix', () => {
      const inputDeltas = [
        [
          [0, 0],
          [0, 0],
        ],
      ];
      const deltas = [[1, 2, 3, 4]];
      const filters = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ];
      const kernel = gpuMock(compareInputDeltas3D, {
        output: [2, 2, 1],
        constants: {
          filterCount: 4,
        },
      });

      expect(kernel(inputDeltas, deltas, filters)).toEqual([
        [new Float32Array([90, 100]), new Float32Array([110, 120])],
      ]);
    });
    test('can add a simple matrix', () => {
      const inputDeltas = [
        [
          [1, 2],
          [3, 4],
        ],
      ];
      const deltas = [[1, 2, 3, 4]];
      const filters = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ];
      const kernel = gpuMock(compareInputDeltas3D, {
        output: [2, 2, 1],
        constants: {
          filterCount: 4,
        },
      });

      expect(kernel(inputDeltas, deltas, filters)).toEqual([
        [new Float32Array([91, 102]), new Float32Array([113, 124])],
      ]);
    });
  });
});
