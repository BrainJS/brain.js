import { GPU } from 'gpu.js';
import { gpuMock } from 'gpu-mock.js';
import { Relu, relu, predict2D, predict3D, compare2D, compare3D } from './relu';
import * as reluActivation from '../activation/relu';
import { mockLayer, mockPraxis } from '../test-utils';
import { makeKernel, setup, teardown } from '../utilities/kernel';

import { randos2D } from '../utilities/randos';
import { ILayerSettings } from './base-layer';

jest.mock('../utilities/kernel', () => {
  return {
    setup: jest.fn(),
    teardown: jest.fn(),
    makeKernel: jest.fn(() => {
      return [[1]];
    }),
    release: jest.fn(),
    clear: jest.fn(),
  };
});

describe('Relu Layer', () => {
  describe('predict2D() (forward propagation)', () => {
    test('can relu a simple matrix', () => {
      const inputs = [
        [0.1, -0.2, 0.3],
        [-0.4, 0.5, -0.6],
        [0.7, -0.8, 0.9],
      ];
      const results = gpuMock(predict2D, { output: [3, 3] })(inputs);
      expect(results).toEqual([
        new Float32Array([0.1, 0, 0.3]),
        new Float32Array([0, 0.5, 0]),
        new Float32Array([0.7, 0, 0.9]),
      ]);
    });
  });

  describe('predict3D() (forward propagation)', () => {
    test('can relu a simple matrix', () => {
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
      const results = gpuMock(predict3D, { output: [3, 3, 2] })(inputs);
      expect(results).toEqual([
        [
          new Float32Array([0.1, 0, 0.3]),
          new Float32Array([0, 0.5, 0]),
          new Float32Array([0.7, 0, 0.9]),
        ],
        [
          new Float32Array([0.1, 0, 0.3]),
          new Float32Array([0, 0.5, 0]),
          new Float32Array([0.7, 0, 0.9]),
        ],
      ]);
    });
  });

  describe('compare2D (back propagation)', () => {
    test('can relu a simple matrix', () => {
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
      const results = gpuMock(compare2D, { output: [3, 3] })(inputs, deltas);
      expect(results).toEqual([
        new Float32Array([1, 0, 1]),
        new Float32Array([0, 1, 0]),
        new Float32Array([1, 0, 1]),
      ]);
    });
  });

  describe('compare3D (back propagation)', () => {
    test('can relu a simple matrix', () => {
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
      const results = gpuMock(compare3D, { output: [3, 3, 2] })(inputs, deltas);
      expect(results).toEqual([
        [
          new Float32Array([1, 0, 1]),
          new Float32Array([0, 1, 0]),
          new Float32Array([1, 0, 1]),
        ],
        [
          new Float32Array([1, 0, 1]),
          new Float32Array([0, 1, 0]),
          new Float32Array([1, 0, 1]),
        ],
      ]);
    });
  });

  describe('.setupKernels()', () => {
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
    describe('2d', () => {
      it('sets up kernels correctly', () => {
        const width = 3;
        const height = 4;
        const mockInputLayer = mockLayer({ width, height });
        const l = new Relu(mockInputLayer);
        expect(l.predictKernel).toBe(null);
        expect(l.compareKernel).toBe(null);
        l.setupKernels();
        expect(l.predictKernel).not.toBe(null);
        expect(l.compareKernel).not.toBe(null);
        expect(makeKernel).toHaveBeenCalledWith(predict2D, {
          functions: [reluActivation.activate],
          immutable: true,
          output: [3, 4],
        });
        expect(makeKernel).toHaveBeenCalledWith(compare2D, {
          functions: [reluActivation.measure],
          immutable: true,
          output: [3, 4],
        });
      });
    });
    describe('3d', () => {
      it('sets up kernels correctly', () => {
        const width = 3;
        const height = 4;
        const depth = 5;
        const mockInputLayer = mockLayer({ width, height, depth });
        const l = new Relu(mockInputLayer);
        expect(l.predictKernel).toBe(null);
        expect(l.compareKernel).toBe(null);
        l.setupKernels();
        expect(l.predictKernel).not.toBe(null);
        expect(l.compareKernel).not.toBe(null);
        expect(makeKernel).toHaveBeenCalledWith(predict3D, {
          functions: [reluActivation.activate],
          immutable: true,
          output: [3, 4, 5],
        });
        expect(makeKernel).toHaveBeenCalledWith(compare3D, {
          functions: [reluActivation.measure],
          immutable: true,
          output: [3, 4, 5],
        });
      });
    });
  });

  describe('.predict()', () => {
    it('calls this.predictKernel() with this.inputLayer.weights', () => {
      const mockWeights = randos2D(1, 1);
      const mockInputLayer = mockLayer({
        weights: mockWeights,
        width: 1,
        height: 1,
        depth: 1,
      });
      const l = new Relu(mockInputLayer);
      (l as any).predictKernel = jest.fn((weights) => weights);
      l.predict();
      expect(l.predictKernel).toBeCalledWith(mockWeights);
      expect(l.weights).toBe(mockWeights);
    });
  });

  describe('.compare()', () => {
    it('calls this.compareKernel() with this.inputLayer.weights & this.inputLayer.deltas', () => {
      const mockWeights = randos2D(1, 1);
      const mockDeltas = randos2D(1, 1);
      const mockInputDeltas = randos2D(1, 1);
      const mockInputLayer = mockLayer({
        width: 1,
        height: 1,
        depth: 1,
        deltas: mockInputDeltas,
      });
      const l = new Relu(mockInputLayer);
      l.weights = mockWeights;
      l.deltas = mockDeltas;
      const expectedDeltas = randos2D(1, 1);
      (l as any).compareKernel = jest.fn((weights, deltas) => expectedDeltas);
      l.compare();
      expect(l.compareKernel).toBeCalledWith(mockWeights, mockDeltas);
      expect(l.inputLayer.deltas).toBe(expectedDeltas);
    });
  });

  describe('relu lambda', () => {
    test('creates a new instance of Relu', () => {
      const width = 3;
      const height = 4;
      const depth = 5;
      const mockInputLayer = mockLayer({ width, height, depth });
      const praxis = mockPraxis(mockInputLayer);
      const praxisSettings = {};
      const settings: ILayerSettings = {
        praxisOpts: praxisSettings,
        initPraxis: jest.fn((settings: typeof praxisSettings) => {
          return praxis;
        }),
      };
      const l = relu(mockInputLayer, settings);
      expect(l.constructor).toBe(Relu);
      expect(l.width).toBe(width);
      expect(l.height).toBe(height);
      expect(l.depth).toBe(depth);
      expect(l.praxis).toBe(praxis);
    });
  });
});
