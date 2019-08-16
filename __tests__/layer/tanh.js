const { gpuMock } = require('gpu-mock.js');
const { Tanh, tanh: tanhLayer, predict2D, predict3D, compare2D, compare3D } = require('../../src/layer/tanh');
const tanhActivation = require('../../src/activation/tanh');
const { shave } = require('../test-utils');

describe('Tanh Layer', () => {
  describe('predict2D() (forward propagation)', () => {
    test('can tanh a simple matrix', () => {
      const inputs = [
        [0.1, 0.2, 0.3, 0.4],
        [0.5, 0.6, 0.7, 0.8],
        [0.9, 1, 1.1, 1.2]
      ];
      const width = 4;
      const height = 3;
      const results = gpuMock(predict2D, { output: [width, height] })(inputs);
      expect(results.length).toBe(height);
      expect(results[0].length).toBe(width);
      expect(shave(results)).toEqual(
        shave([
          [0.09966800, 0.19737533, 0.29131261, 0.37994897],
          [0.46211717, 0.53704959, 0.60436779, 0.66403675],
          [0.71629786, 0.76159418, 0.80049902, 0.83365458],
        ])
      );
    });
  });

  describe('predict3D() (forward propagation)', () => {
    test('can tanh a simple matrix', () => {
      const inputs = [
        [
          [0.1, 0.2, 0.3, 0.4],
          [0.5, 0.6, 0.7, 0.8],
          [0.9, 1, 1.1, 1.2]
        ],[
          [0.1, 0.2, 0.3, 0.4],
          [0.5, 0.6, 0.7, 0.8],
          [0.9, 1, 1.1, 1.2]
        ]
      ];
      const width = 4;
      const height = 3;
      const depth = 2;
      const results = gpuMock(predict3D, { output: [width, height, depth] })(inputs);

      expect(results.length).toBe(depth);
      expect(results[0].length).toBe(height);
      expect(results[0][0].length).toBe(width);
      expect(shave(results)).toEqual(
        shave([
          [
            [0.09966800, 0.19737533, 0.29131261, 0.37994897],
            [0.46211717, 0.53704959, 0.60436779, 0.66403675],
            [0.71629786, 0.76159418, 0.80049902, 0.83365458],
          ],[
            [0.09966800, 0.19737533, 0.29131261, 0.37994897],
            [0.46211717, 0.53704959, 0.60436779, 0.66403675],
            [0.71629786, 0.76159418, 0.80049902, 0.83365458],
          ]
        ])
      );
    });
  });

  describe('compare2D() (back propagation)', () => {
    test('can tanh a simple matrix', () => {
      const inputs = [
        [0.1, 0.2, 0.3, 0.4],
        [0.5, 0.6, 0.7, 0.8],
        [0.9, 1, 1.1, 1.2]
      ];
      const deltas = [
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1]
      ];
      const width = 4;
      const height = 3;
      const results = gpuMock(compare2D, { output: [width, height] })(inputs, deltas);
      expect(results.length).toBe(height);
      expect(results[0].length).toBe(width);
      expect(shave(results)).toEqual(
        shave([
          [0.99000001, 0.95999998, 0.91000003, 0.83999997],
          [0.75000000, 0.63999999, 0.50999999, 0.36000001],
          [0.19000000, 0.00000000, -0.20999999, -0.44000000],
        ])
      );
    });
  });

  describe('compare3D() (back propagation)', () => {
    test('can tanh a simple matrix', () => {
      const inputs = [
        [
          [0.1, 0.2, 0.3, 0.4],
          [0.5, 0.6, 0.7, 0,8],
          [0.9, 1, 1.1, 1.2]
        ], [
          [0.1, 0.2, 0.3, 0.4],
          [0.5, 0.6, 0.7, 0,8],
          [0.9, 1, 1.1, 1.2]
        ]
      ];
      const deltas = [
        [
          [1, 1, 1, 1],
          [1, 1, 1, 1],
          [1, 1, 1, 1]
        ], [
          [1, 1, 1, 1],
          [1, 1, 1, 1],
          [1, 1, 1, 1]
        ]
      ];
      const width = 4;
      const height = 3;
      const depth = 2;
      const results = gpuMock(compare3D, { output: [width, height, depth] })(inputs, deltas);
      expect(results.length).toBe(depth);
      expect(results[0].length).toBe(height);
      expect(results[0][0].length).toBe(width);
      expect(shave(results)).toEqual(
        shave([
          [
            [0.99000001, 0.95999998, 0.91000003, 0.83999997],
            [0.75000000, 0.63999999, 0.50999999, 1],
            [0.19000000, 0.00000000, -0.20999999, -0.44000000],
          ],[
            [0.99000001, 0.95999998, 0.91000003, 0.83999997],
            [0.75000000, 0.63999999, 0.50999999, 1],
            [0.19000000, 0.00000000, -0.20999999, -0.44000000],
          ]])
      );
    });
  });

  describe('.setupKernels()', () => {
    describe('2d', () => {
      it('sets up kernels correctly', () => {
        const width = 3;
        const height = 4;
        const mockInputLayer = { width, height };
        const l = new Tanh(mockInputLayer);
        expect(l.predictKernel).toBe(null);
        expect(l.compareKernel).toBe(null);
        l.setupKernels();
        expect(l.predictKernel).not.toBe(null);
        expect(l.predictKernel.source).toBe(predict2D.toString());
        expect(l.predictKernel.output).toEqual([width, height]);
        expect(l.predictKernel.functions.length).toBe(1);
        expect(l.predictKernel.functions[0].source).toBe(tanhActivation.activate.toString());
        expect(l.compareKernel).not.toBe(null);
        expect(l.compareKernel.source).toBe(compare2D.toString());
        expect(l.compareKernel.output).toEqual([width, height]);
        expect(l.compareKernel.functions.length).toBe(1);
        expect(l.compareKernel.functions[0].source).toBe(tanhActivation.measure.toString());
      });
    });
    describe('3d', () => {
      it('sets up kernels correctly', () => {
        const width = 3;
        const height = 4;
        const depth = 5;
        const mockInputLayer = { width, height, depth };
        const l = new Tanh(mockInputLayer);
        expect(l.predictKernel).toBe(null);
        expect(l.compareKernel).toBe(null);
        l.setupKernels();
        expect(l.predictKernel).not.toBe(null);
        expect(l.predictKernel.source).toBe(predict3D.toString());
        expect(l.predictKernel.output).toEqual([width, height, depth]);
        expect(l.predictKernel.functions.length).toBe(1);
        expect(l.predictKernel.functions[0].source).toBe(tanhActivation.activate.toString());
        expect(l.compareKernel).not.toBe(null);
        expect(l.compareKernel.source).toBe(compare3D.toString());
        expect(l.compareKernel.output).toEqual([width, height, depth]);
        expect(l.compareKernel.functions.length).toBe(1);
        expect(l.compareKernel.functions[0].source).toBe(tanhActivation.measure.toString());
      });
    });
  });

  describe('.predict()', () => {
    it('calls this.predictKernel() with this.inputLayer.weights', () => {
      const mockWeights = {};
      const mockInputLayer = { weights: mockWeights, width: 1, height: 1, depth: 1 };
      const l = new Tanh(mockInputLayer);
      l.predictKernel = jest.fn(weights => weights);
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
        depth: 1
      };
      const l = new Tanh(mockInputLayer);
      l.weights = mockWeights;
      l.deltas = mockDeltas;
      l.compareKernel = jest.fn((weights, deltas) => deltas);
      l.compare();
      expect(l.compareKernel).toBeCalledWith(mockWeights, mockDeltas);
      expect(l.deltas).toBe(mockDeltas);
    });
  });

  describe('tanh lambda', () => {
    test('creates a new instance of Tanh', () => {
      const width = 3;
      const height = 4;
      const depth = 5;
      const mockInputLayer = { width, height, depth };
      const mockPraxisInstance = {};
      const mockPraxis = jest.fn(() => mockPraxisInstance);
      const settings = { praxis: mockPraxis };
      const l = tanhLayer(mockInputLayer, settings);
      expect(l.constructor).toBe(Tanh);
      expect(l.width).toBe(width);
      expect(l.height).toBe(height);
      expect(l.depth).toBe(depth);
      expect(mockPraxis).toBeCalled();
      expect(l.praxis).toBe(mockPraxisInstance);
    });
  });
});
