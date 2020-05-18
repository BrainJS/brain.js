const { GPU } = require('gpu.js');
const { gpuMock } = require('gpu-mock.js');
const { Input } = require('../../src/layer/input');
const {
  Multiply,
  predict,
  compareFromX,
  compareFromY,
} = require('../../src/layer/multiply');
const { Random } = require('../../src/layer/random');
const { setup, teardown } = require('../../src/utilities/kernel');
const { injectIstanbulCoverage } = require('../test-utils');

describe('Multiply Layer', () => {
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
    test('can multiply a simple matrix', () => {
      const inputs1 = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      const inputs2 = [
        [7, 8],
        [9, 10],
        [11, 12],
      ];
      const results = gpuMock(predict, {
        output: [2, 2],
        constants: {
          size: inputs2.length,
        },
      })(inputs1, inputs2);

      expect(results).toEqual([
        new Float32Array([58, 64]),
        new Float32Array([139, 154]),
      ]);
    });
  });
  describe('.compareFromX (back propagation)', () => {
    test('can multiply a simple matrix', () => {
      const m1 = [
        [3, 3],
        [3, 3],
      ];
      const m2 = [
        [3, 3],
        [3, 3],
      ];
      const deltas = [
        [3, 3],
        [3, 3],
      ];
      const result = gpuMock(compareFromX, {
        output: [2, 2],
        constants: {
          size: 2,
        },
      })(deltas, m1, m2);

      expect(result).toEqual([
        new Float32Array([21, 21]),
        new Float32Array([21, 21]),
      ]);
    });
    test('can compare a simple matrix', () => {
      const deltas = [[1], [2], [3]];
      const inputDeltas = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];
      const inputWeights = [[1], [2]];
      const result = gpuMock(compareFromX, {
        output: [2, 3],
        constants: {
          size: 1,
        },
      })(deltas, inputDeltas, inputWeights);

      expect(result).toEqual([
        new Float32Array([2, 4]),
        new Float32Array([5, 8]),
        new Float32Array([8, 12]),
      ]);
    });
  });
  describe('.compareFromY (back propagation)', () => {
    test('can multiply a simple matrix 2x2 * 2x2 = 2x2', () => {
      const m1 = [
        [3, 3],
        [3, 3],
      ];
      const m2 = [
        [3, 3],
        [3, 3],
      ];
      const deltas = [
        [3, 3],
        [3, 3],
      ];
      const result = gpuMock(compareFromY, {
        output: [2, 2],
        constants: {
          size: 2,
        },
      })(deltas, m1, m2);

      expect(result).toEqual([
        new Float32Array([21, 21]),
        new Float32Array([21, 21]),
      ]);
    });
    test('can compare a simple matrix 3x1 * 2x1 = 3x2', () => {
      const deltas = [[1], [2], [3]];
      const inputDeltas = [[1], [2]];
      const inputWeights = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];
      const result = gpuMock(compareFromY, {
        output: [1, 2],
        constants: {
          size: 3,
        },
      })(deltas, inputDeltas, inputWeights);

      expect(result).toEqual([new Float32Array([23]), new Float32Array([30])]);
    });
    test('can compare a simple matrix 3x1 * 1x3 = 3x1', () => {
      const deltas = [[1, 2, 3]];
      const inputDeltas = [[1], [2], [3]];
      const inputWeights = [[1, 2, 3]];
      const result = gpuMock(compareFromY, {
        output: [1, 3],
        constants: {
          size: 1,
        },
      })(deltas, inputDeltas, inputWeights);

      expect(result).toEqual([
        new Float32Array([2]),
        new Float32Array([4]),
        new Float32Array([6]),
      ]);
    });
  });
  describe('.validate', () => {
    test('throws error when dimension are incompatible', () => {
      expect(() => {
        Multiply.prototype.validate.call({
          inputLayer1: { width: 1, height: 1 },
          inputLayer2: { width: 1, height: 2 },
          height: 1,
          width: 1,
        });
      }).toThrow();
    });

    test('validates when dimension are compatible', () => {
      Multiply.prototype.validate.call({
        inputLayer1: { width: 1, height: 1 },
        inputLayer2: { width: 1, height: 1 },
        height: 1,
        width: 1,
      });
    });
  });

  describe('instance', () => {
    describe('.predict method', () => {
      test('validates, multiplies, and sets .weights', () => {
        const inputLayer1 = {
          width: 3,
          height: 2,
          weights: [
            [1, 2, 3],
            [4, 5, 6],
          ],
        };
        const inputLayer2 = {
          width: 2,
          height: 3,
          weights: [
            [7, 8],
            [9, 10],
            [11, 12],
          ],
        };
        const multiplyLayer = new Multiply(inputLayer1, inputLayer2);
        multiplyLayer.validate();
        multiplyLayer.setupKernels();
        multiplyLayer.predict();

        expect(multiplyLayer.weights).toEqual([
          new Float32Array([58, 64]),
          new Float32Array([139, 154]),
        ]);
      });
    });
    describe('when used with Input layer', () => {
      test('is compatible', () => {
        const random = new Random({ height: 3, width: 2 });
        const input = new Input({ height: 2 });
        const multiply = new Multiply(random, input);

        random.validate();
        random.setupKernels();

        input.validate();
        input.setupKernels();

        multiply.validate();
        multiply.setupKernels();

        input.predict([0, 1]);
        random.predict();
        multiply.predict();
        expect(multiply.width).toEqual(1);
        expect(multiply.height).toEqual(3);
      });
    });
  });
});
