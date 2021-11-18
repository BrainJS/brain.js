import { gpuMock } from 'gpu-mock.js';
import { GPU } from 'gpu.js';
import * as leakyReluActivation from '../activation/leaky-relu';
import { ILayerSettings } from './base-layer';
import {
  compare2D,
  compare3D,
  LeakyRelu,
  leakyRelu,
  predict2D,
  predict3D,
} from './leaky-relu';
import { makeKernel, setup, teardown } from '../utilities/kernel';
import { ones2D } from '../utilities/ones';
import { randos2D } from '../utilities/randos';
import {
  IWithCompareKernel,
  IWithPredictKernel,
  mockLayer,
  mockPraxis,
} from '../test-utils';

jest.mock('../../src/utilities/kernel', () => {
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
        const l = new LeakyRelu(mockInputLayer);
        expect(l.predictKernel).toBe(null);
        expect(l.compareKernel).toBe(null);
        l.setupKernels();
        expect(l.predictKernel).not.toBe(null);
        expect(l.compareKernel).not.toBe(null);
        expect(makeKernel).toHaveBeenCalledWith(predict2D, {
          functions: [leakyReluActivation.activate],
          immutable: true,
          output: [3, 4],
        });
        expect(makeKernel).toHaveBeenCalledWith(compare2D, {
          functions: [leakyReluActivation.measure],
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
        const l = new LeakyRelu(mockInputLayer);
        expect(l.predictKernel).toBe(null);
        expect(l.compareKernel).toBe(null);
        l.setupKernels();
        expect(l.predictKernel).not.toBe(null);
        expect(l.compareKernel).not.toBe(null);
        expect(makeKernel).toHaveBeenCalledWith(predict3D, {
          functions: [leakyReluActivation.activate],
          immutable: true,
          output: [3, 4, 5],
        });
        expect(makeKernel).toHaveBeenCalledWith(compare3D, {
          functions: [leakyReluActivation.measure],
          immutable: true,
          output: [3, 4, 5],
        });
      });
    });
  });

  describe('.predict()', () => {
    it('calls this.predictKernel() with this.inputLayer.weights', () => {
      const mockWeights = ones2D(1, 1);
      const mockInputLayer = mockLayer({
        weights: mockWeights,
        width: 1,
        height: 1,
        depth: 1,
      });
      const l = new LeakyRelu(mockInputLayer);
      const spy = (((l as unknown) as IWithPredictKernel).predictKernel = jest.fn(
        (values) => values
      ));
      l.predict();
      expect(spy).toBeCalledWith(mockWeights);
      expect(l.weights).toBe(mockWeights);
    });
  });

  describe('.compare()', () => {
    it('calls this.compareKernel() with this.inputLayer.weights & this.inputLayer.deltas', () => {
      const mockInputLayer = mockLayer({
        width: 1,
        height: 1,
        depth: 1,
      });
      const l = new LeakyRelu(mockInputLayer);
      const weights = (l.weights = randos2D(1, 1));
      const deltas = (l.deltas = randos2D(1, 1));
      const results = randos2D(1, 1);
      ((l as unknown) as IWithCompareKernel).compareKernel = jest.fn(
        (weights, deltas) => results
      );
      l.compare();
      expect(l.compareKernel).toBeCalledWith(weights, deltas);
      expect(l.deltas).toBe(results);
    });
  });

  describe('leakyRelu lambda', () => {
    test('creates a new instance of LeakyRelu', () => {
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
      const l = leakyRelu(mockInputLayer, settings);
      expect(l.constructor).toBe(LeakyRelu);
      expect(l.width).toBe(width);
      expect(l.height).toBe(height);
      expect(l.depth).toBe(depth);
      expect(l.praxis).toBe(praxis);
    });
  });
});
