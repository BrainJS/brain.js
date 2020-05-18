const { GPU } = require('gpu.js');
const { gpuMock } = require('gpu-mock.js');
const {
  LeakyRelu,
  leakyRelu: leakyReluLayer,
  predict2D,
  predict3D,
  compare2D,
  compare3D,
} = require('../../src/layer/leaky-relu');
const leakyReluActivation = require('../../src/activation/leaky-relu');
const { expectFunction } = require('../test-utils');
const { setup, teardown } = require('../../src/utilities/kernel');
const { injectIstanbulCoverage } = require('../test-utils');

describe('Leaky Relu Layer', () => {
  describe('predict2D() (forward propagation)', () => {
    test('can leaky relu a simple matrix', () => {
      const inputs = [
        [0.1, -0.2, 0.3],
        [-0.4, 0.5, -0.6],
        [0.7, -0.8, 0.9],
      ];
      const results = gpuMock(predict2D, {
        output: [3, 3],
      })(inputs);

      expect(results).toEqual([
        new Float32Array([0.1, -0.002, 0.3]),
        new Float32Array([-0.004, 0.5, -0.006]),
        new Float32Array([0.7, -0.008, 0.9]),
      ]);
    });
  });

  describe('predict3D() (forward propagation)', () => {
    test('can leaky relu a simple matrix', () => {
      const inputs = [
        [
          [0.1, -0.2, 0.3],
          [-0.4, 0.5, -0.6],
          [0.7, -0.8, 0.9],
        ],
        [
          [0.1, -0.2, 0.3],
          [-0.4, 0.5, -0.6],
          [0.7, -0.8, 0.9],
        ],
      ];
      const results = gpuMock(predict3D, {
        output: [3, 3, 2],
      })(inputs);

      expect(results).toEqual([
        [
          new Float32Array([0.1, -0.002, 0.3]),
          new Float32Array([-0.004, 0.5, -0.006]),
          new Float32Array([0.7, -0.008, 0.9]),
        ],
        [
          new Float32Array([0.1, -0.002, 0.3]),
          new Float32Array([-0.004, 0.5, -0.006]),
          new Float32Array([0.7, -0.008, 0.9]),
        ],
      ]);
    });
  });

  describe('compare2D() (back propagation)', () => {
    test('can leaky relu a simple matrix', () => {
      const inputs = [
        [0.1, -0.2, 0.3],
        [-0.4, 0.5, -0.6],
        [0.7, -0.8, 0.9],
      ];
      const deltas = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ];
      const results = gpuMock(compare2D, {
        output: [3, 3],
      })(inputs, deltas);

      expect(results).toEqual([
        new Float32Array([1, 0.01, 1]),
        new Float32Array([0.01, 1, 0.01]),
        new Float32Array([1, 0.01, 1]),
      ]);
    });
  });

  describe('compare3D() (back propagation)', () => {
    test('can leaky relu a simple matrix', () => {
      const inputs = [
        [
          [0.1, -0.2, 0.3],
          [-0.4, 0.5, -0.6],
          [0.7, -0.8, 0.9],
        ],
        [
          [0.1, -0.2, 0.3],
          [-0.4, 0.5, -0.6],
          [0.7, -0.8, 0.9],
        ],
      ];
      const deltas = [
        [
          [1, 1, 1],
          [1, 1, 1],
          [1, 1, 1],
        ],
        [
          [1, 1, 1],
          [1, 1, 1],
          [1, 1, 1],
        ],
      ];
      const results = gpuMock(compare3D, {
        output: [3, 3, 2],
      })(inputs, deltas);

      expect(results).toEqual([
        [
          new Float32Array([1, 0.01, 1]),
          new Float32Array([0.01, 1, 0.01]),
          new Float32Array([1, 0.01, 1]),
        ],
        [
          new Float32Array([1, 0.01, 1]),
          new Float32Array([0.01, 1, 0.01]),
          new Float32Array([1, 0.01, 1]),
        ],
      ]);
    });
  });

  describe('.setupKernels()', () => {
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
    describe('2d', () => {
      it('sets up kernels correctly', () => {
        const width = 3;
        const height = 4;
        const mockInputLayer = { width, height };
        const l = new LeakyRelu(mockInputLayer);
        expect(l.predictKernel).toBe(null);
        expect(l.compareKernel).toBe(null);
        l.setupKernels();
        expect(l.predictKernel).not.toBe(null);
        expectFunction(l.predictKernel.source, predict2D);
        expect(l.predictKernel.output).toEqual([width, height]);
        expect(l.predictKernel.functions.length).toBe(1);
        expectFunction(
          l.predictKernel.functions[0].source,
          leakyReluActivation.activate
        );
        expect(l.compareKernel).not.toBe(null);
        expectFunction(l.compareKernel.source, compare2D);
        expect(l.compareKernel.output).toEqual([width, height]);
        expect(l.compareKernel.functions.length).toBe(1);
        expectFunction(
          l.compareKernel.functions[0].source,
          leakyReluActivation.measure
        );
      });
    });
    describe('3d', () => {
      it('sets up kernels correctly', () => {
        const width = 3;
        const height = 4;
        const depth = 5;
        const mockInputLayer = { width, height, depth };
        const l = new LeakyRelu(mockInputLayer);
        expect(l.predictKernel).toBe(null);
        expect(l.compareKernel).toBe(null);
        l.setupKernels();
        expect(l.predictKernel).not.toBe(null);
        expectFunction(l.predictKernel.source, predict3D);
        expect(l.predictKernel.output).toEqual([width, height, depth]);
        expect(l.predictKernel.functions.length).toBe(1);
        expectFunction(
          l.predictKernel.functions[0].source,
          leakyReluActivation.activate
        );
        expect(l.compareKernel).not.toBe(null);
        expectFunction(l.compareKernel.source, compare3D);
        expect(l.compareKernel.output).toEqual([width, height, depth]);
        expect(l.compareKernel.functions.length).toBe(1);
        expectFunction(
          l.compareKernel.functions[0].source,
          leakyReluActivation.measure
        );
      });
    });
  });

  describe('.predict()', () => {
    it('calls this.predictKernel() with this.inputLayer.weights', () => {
      const mockWeights = {};
      const mockInputLayer = {
        weights: mockWeights,
        width: 1,
        height: 1,
        depth: 1,
      };
      const l = new LeakyRelu(mockInputLayer);
      l.predictKernel = jest.fn((weights) => weights);
      l.predict();
      expect(l.predictKernel).toBeCalledWith(mockWeights);
      expect(l.weights).toBe(mockWeights);
    });
  });

  describe('.compare()', () => {
    it('calls this.compareKernel() with this.inputLayer.weights & this.inputLayer.deltas', () => {
      const mockWeights = {};
      const mockDeltas = {};
      const mockInputLayer = {
        width: 1,
        height: 1,
        depth: 1,
      };
      const l = new LeakyRelu(mockInputLayer);
      l.weights = mockWeights;
      l.deltas = mockDeltas;
      l.compareKernel = jest.fn((weights, deltas) => deltas);
      l.compare();
      expect(l.compareKernel).toBeCalledWith(mockWeights, mockDeltas);
      expect(l.deltas).toBe(mockDeltas);
    });
  });

  describe('leakyRelu lambda', () => {
    test('creates a new instance of LeakyRelu', () => {
      const width = 3;
      const height = 4;
      const depth = 5;
      const mockInputLayer = { width, height, depth };
      const mockPraxisInstance = {};
      const mockPraxis = jest.fn(() => mockPraxisInstance);
      const settings = { praxis: mockPraxis };
      const l = leakyReluLayer(mockInputLayer, settings);
      expect(l.constructor).toBe(LeakyRelu);
      expect(l.width).toBe(width);
      expect(l.height).toBe(height);
      expect(l.depth).toBe(depth);
      expect(mockPraxis).toBeCalled();
      expect(l.praxis).toBe(mockPraxisInstance);
    });
  });
});
