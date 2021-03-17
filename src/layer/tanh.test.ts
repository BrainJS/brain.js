import { GPU } from 'gpu.js';
import { gpuMock } from 'gpu-mock.js';

import { Tanh, tanh, predict2D, predict3D, compare2D, compare3D } from './tanh';
import * as tanhActivation from '../activation/tanh';
import { mockLayer, mockPraxis, shave2D, shave3D } from '../test-utils';
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

describe('Tanh Layer', () => {
  describe('predict2D() (forward propagation)', () => {
    test('can tanh a simple matrix', () => {
      const inputs = [
        [0.1, 0.2, 0.3, 0.4],
        [0.5, 0.6, 0.7, 0.8],
        [0.9, 1, 1.1, 1.2],
      ];
      const width = 4;
      const height = 3;
      const results = gpuMock(predict2D, { output: [width, height] })(
        inputs
      ) as Float32Array[];
      expect(results.length).toBe(height);
      expect(results[0].length).toBe(width);
      expect(shave2D(results)).toEqual(
        shave2D([
          Float32Array.from([0.099668, 0.19737533, 0.29131261, 0.37994897]),
          Float32Array.from([0.46211717, 0.53704959, 0.60436779, 0.66403675]),
          Float32Array.from([0.71629786, 0.76159418, 0.80049902, 0.83365458]),
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
          [0.9, 1, 1.1, 1.2],
        ],
        [
          [0.1, 0.2, 0.3, 0.4],
          [0.5, 0.6, 0.7, 0.8],
          [0.9, 1, 1.1, 1.2],
        ],
      ];
      const width = 4;
      const height = 3;
      const depth = 2;
      const results = gpuMock(predict3D, { output: [width, height, depth] })(
        inputs
      ) as Float32Array[][];

      expect(results.length).toBe(depth);
      expect(results[0].length).toBe(height);
      expect(results[0][0].length).toBe(width);
      expect(shave3D(results)).toEqual(
        shave3D([
          [
            Float32Array.from([0.099668, 0.19737533, 0.29131261, 0.37994897]),
            Float32Array.from([0.46211717, 0.53704959, 0.60436779, 0.66403675]),
            Float32Array.from([0.71629786, 0.76159418, 0.80049902, 0.83365458]),
          ],
          [
            Float32Array.from([0.099668, 0.19737533, 0.29131261, 0.37994897]),
            Float32Array.from([0.46211717, 0.53704959, 0.60436779, 0.66403675]),
            Float32Array.from([0.71629786, 0.76159418, 0.80049902, 0.83365458]),
          ],
        ])
      );
    });
  });

  describe('compare2D() (back propagation)', () => {
    test('can tanh a simple matrix', () => {
      const inputs = [
        [0.1, 0.2, 0.3, 0.4],
        [0.5, 0.6, 0.7, 0.8],
        [0.9, 1, 1.1, 1.2],
      ];
      const deltas = [
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
      ];
      const width = 4;
      const height = 3;
      const results = gpuMock(compare2D, { output: [width, height] })(
        inputs,
        deltas
      ) as Float32Array[];
      expect(results.length).toBe(height);
      expect(results[0].length).toBe(width);
      expect(shave2D(results)).toEqual(
        shave2D([
          Float32Array.from([0.99000001, 0.95999998, 0.91000003, 0.83999997]),
          Float32Array.from([0.75, 0.63999999, 0.50999999, 0.36000001]),
          Float32Array.from([0.19, 0.0, -0.20999999, -0.44]),
        ])
      );
    });
  });

  describe('compare3D() (back propagation)', () => {
    test('can tanh a simple matrix', () => {
      const inputs = [
        [
          [0.1, 0.2, 0.3, 0.4],
          [0.5, 0.6, 0.7, 0, 8],
          [0.9, 1, 1.1, 1.2],
        ],
        [
          [0.1, 0.2, 0.3, 0.4],
          [0.5, 0.6, 0.7, 0, 8],
          [0.9, 1, 1.1, 1.2],
        ],
      ];
      const deltas = [
        [
          [1, 1, 1, 1],
          [1, 1, 1, 1],
          [1, 1, 1, 1],
        ],
        [
          [1, 1, 1, 1],
          [1, 1, 1, 1],
          [1, 1, 1, 1],
        ],
      ];
      const width = 4;
      const height = 3;
      const depth = 2;
      const results = gpuMock(compare3D, { output: [width, height, depth] })(
        inputs,
        deltas
      ) as Float32Array[][];
      expect(results.length).toBe(depth);
      expect(results[0].length).toBe(height);
      expect(results[0][0].length).toBe(width);
      expect(shave3D(results)).toEqual(
        shave3D([
          [
            Float32Array.from([0.99000001, 0.95999998, 0.91000003, 0.83999997]),
            Float32Array.from([0.75, 0.63999999, 0.50999999, 1]),
            Float32Array.from([0.19, 0.0, -0.20999999, -0.44]),
          ],
          [
            Float32Array.from([0.99000001, 0.95999998, 0.91000003, 0.83999997]),
            Float32Array.from([0.75, 0.63999999, 0.50999999, 1]),
            Float32Array.from([0.19, 0.0, -0.20999999, -0.44]),
          ],
        ])
      );
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
        const l = new Tanh(mockInputLayer);
        expect(l.predictKernel).toBe(null);
        expect(l.compareKernel).toBe(null);
        l.setupKernels();
        expect(l.predictKernel).not.toBe(null);
        expect(l.compareKernel).not.toBe(null);
        expect(makeKernel).toHaveBeenCalledWith(predict2D, {
          functions: [tanhActivation.activate],
          immutable: true,
          output: [3, 4],
        });
        expect(makeKernel).toHaveBeenCalledWith(compare2D, {
          functions: [tanhActivation.measure],
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
        const l = new Tanh(mockInputLayer);
        expect(l.predictKernel).toBe(null);
        expect(l.compareKernel).toBe(null);
        l.setupKernels();
        expect(l.predictKernel).not.toBe(null);
        expect(l.compareKernel).not.toBe(null);
        expect(makeKernel).toHaveBeenCalledWith(predict3D, {
          functions: [tanhActivation.activate],
          immutable: true,
          output: [3, 4, 5],
        });
        expect(makeKernel).toHaveBeenCalledWith(compare3D, {
          functions: [tanhActivation.measure],
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
      const l = new Tanh(mockInputLayer);
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
      const mockInputLayer = mockLayer({
        width: 1,
        height: 1,
        depth: 1,
      });
      const l = new Tanh(mockInputLayer);
      l.weights = mockWeights;
      l.deltas = mockDeltas;
      const expected = randos2D(1, 1);
      (l as any).compareKernel = jest.fn((weights, deltas) => expected);
      l.compare();
      expect(l.compareKernel).toBeCalledWith(mockWeights, mockDeltas);
      expect(l.inputLayer.deltas).toBe(expected);
    });
  });

  describe('tanh lambda', () => {
    test('creates a new instance of Tanh', () => {
      const width = 3;
      const height = 4;
      const depth = 5;
      const mockInputLayer = mockLayer({ width, height, depth });
      const mockPraxisInstance = mockPraxis(mockInputLayer);
      const settings: ILayerSettings = { initPraxis: () => mockPraxisInstance };
      const l = tanh(mockInputLayer, settings);
      expect(l.constructor).toBe(Tanh);
      expect(l.width).toBe(width);
      expect(l.height).toBe(height);
      expect(l.depth).toBe(depth);
      expect(l.praxis).toBe(mockPraxisInstance);
    });
  });
});
