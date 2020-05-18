const { GPU } = require('gpu.js');
const { gpuMock } = require('gpu-mock.js');
const {
  predict,
  compareFilterDeltas,
  compareInputDeltas,
  compareBiases,
} = require('../../src/layer/convolution');
const { setup, teardown } = require('../../src/utilities/kernel');
const { onePlusPlus3D } = require('../test-utils');
const { injectIstanbulCoverage } = require('../test-utils');

describe('Convolution Layer', () => {
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
    test('can convolution a simple matrix', () => {
      const inputs = [
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ],
      ];
      const filters = [
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ],
      ];
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

      expect(results).toEqual([
        new Float32Array([286, 187, 91]),
        new Float32Array([155, 95, 43]),
        new Float32Array([51, 27, 10]),
      ]);
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

      expect(results).toEqual([
        [new Float32Array([45, 56]), new Float32Array([87, 98])],
      ]);
    });
  });

  describe('.compareInputDeltas (back propagation)', () => {
    test('can convolution a simple matrix', () => {
      const inputDeltas = [
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ],
      ];
      const filters = [
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ],
      ];
      const deltas = [
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ],
      ];
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
          deltaZ: 0,
        },
      })(inputDeltas, filters, deltas);

      expect(results).toEqual([
        new Float32Array([2, 6, 13]),
        new Float32Array([12, 31, 62]),
        new Float32Array([37, 92, 174]),
      ]);
    });
  });

  describe('.compareBiases (back propagation)', () => {
    const deltas = [
      [
        [0, 16],
        [8, 24],
      ],
      [
        [1, 17],
        [9, 25],
      ],
      [
        [2, 18],
        [10, 26],
      ],
      [
        [3, 19],
        [11, 27],
      ],
      [
        [4, 20],
        [12, 28],
      ],
      [
        [5, 21],
        [13, 29],
      ],
      [
        [6, 22],
        [14, 30],
      ],
      [
        [7, 23],
        [15, 31],
      ],
    ];
    test('accumulates values from deltas correctly from 0', () => {
      const biasDeltas = [
        [[0]],
        [[0]],
        [[0]],
        [[0]],
        [[0]],
        [[0]],
        [[0]],
        [[0]],
      ];
      const kernel = gpuMock(compareBiases, {
        output: [1, 1, 8],
        constants: {
          deltaWidth: 2,
          deltaHeight: 2,
        },
      });
      const result = kernel(biasDeltas, deltas);
      const expectedBiasDeltas = [
        [new Float32Array([48])],
        [new Float32Array([52])],
        [new Float32Array([56])],
        [new Float32Array([60])],
        [new Float32Array([64])],
        [new Float32Array([68])],
        [new Float32Array([72])],
        [new Float32Array([76])],
      ];

      expect(result).toEqual(expectedBiasDeltas);
    });
    test('accumulates values from deltas correctly from greater than 0', () => {
      const biasDeltas = [
        [[0]],
        [[1]],
        [[2]],
        [[3]],
        [[4]],
        [[5]],
        [[6]],
        [[7]],
      ];
      const kernel = gpuMock(compareBiases, {
        output: [1, 1, 8],
        constants: {
          deltaWidth: 2,
          deltaHeight: 2,
        },
      });
      const result = kernel(biasDeltas, deltas);
      const expectedBiasDeltas = [
        [new Float32Array([48])],
        [new Float32Array([53])],
        [new Float32Array([58])],
        [new Float32Array([63])],
        [new Float32Array([68])],
        [new Float32Array([73])],
        [new Float32Array([78])],
        [new Float32Array([83])],
      ];

      expect(result).toEqual(expectedBiasDeltas);
    });
  });
});
