import { gpuMock } from 'gpu-mock.js';
import {
  Sigmoid,
  sigmoid,
  predict2D,
  predict3D,
  compare2D,
  compare3D,
} from '../../src/layer/sigmoid';
import { mockLayer, mockPraxis, shave2D, shave3D } from '../test-utils';
import * as sigmoidActivation from '../../src/activation/sigmoid';
import { makeKernel } from '../../src/utilities/kernel';
import { ILayerSettings } from '../../src/layer/base-layer';

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

describe('Sigmoid Layer', () => {
  describe('predict2D() (forward propagation)', () => {
    test('can sigmoid a simple matrix', () => {
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
          Float32Array.from([0.52497917, 0.54983401, 0.57444251, 0.59868765]),
          Float32Array.from([0.62245935, 0.64565629, 0.6681878, 0.68997449]),
          Float32Array.from([0.71094948, 0.7310586, 0.75026011, 0.76852477]),
        ])
      );
    });
  });

  describe('predict3D() (forward propagation)', () => {
    test('can sigmoid a simple matrix', () => {
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
            Float32Array.from([0.52497917, 0.54983401, 0.57444251, 0.59868765]),
            Float32Array.from([0.62245935, 0.64565629, 0.6681878, 0.68997449]),
            Float32Array.from([0.71094948, 0.7310586, 0.75026011, 0.76852477]),
          ],
          [
            Float32Array.from([0.52497917, 0.54983401, 0.57444251, 0.59868765]),
            Float32Array.from([0.62245935, 0.64565629, 0.6681878, 0.68997449]),
            Float32Array.from([0.71094948, 0.7310586, 0.75026011, 0.76852477]),
          ],
        ])
      );
    });
  });

  describe('compare2D (back propagation)', () => {
    test('can sigmoid a simple matrix', () => {
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
          Float32Array.from([
            0.09000000000000001,
            0.16000000000000003,
            0.20999999,
            0.23999999,
          ]),
          Float32Array.from([
            0.25,
            0.23999999,
            0.20999999,
            0.15999999999999998,
          ]),
          Float32Array.from([0.08999999999999998, 0.0, -0.11, -0.23999999]),
        ])
      );
    });
  });

  describe('compare3D (back propagation)', () => {
    test('can sigmoid a simple matrix', () => {
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
            Float32Array.from([
              0.09000000000000001,
              0.16000000000000003,
              0.20999999,
              0.23999999,
            ]),
            Float32Array.from([
              0.25,
              0.23999999,
              0.20999999,
              0.15999999999999998,
            ]),
            Float32Array.from([0.08999999999999998, 0.0, -0.11, -0.23999999]),
          ],
          [
            Float32Array.from([
              0.09000000000000001,
              0.16000000000000003,
              0.20999999,
              0.23999999,
            ]),
            Float32Array.from([
              0.25,
              0.23999999,
              0.20999999,
              0.15999999999999998,
            ]),
            Float32Array.from([0.08999999999999998, 0.0, -0.11, -0.23999999]),
          ],
        ])
      );
    });
  });

  describe('.setupKernels()', () => {
    describe('2d', () => {
      it('sets up kernels correctly', () => {
        const width = 3;
        const height = 4;
        const mockInputLayer = mockLayer({ width, height });
        const l = new Sigmoid(mockInputLayer);
        expect(l.predictKernel).toBe(null);
        expect(l.compareKernel).toBe(null);
        l.setupKernels();
        expect(l.predictKernel).not.toBe(null);
        expect(l.compareKernel).not.toBe(null);
        expect(makeKernel).toHaveBeenCalledWith(predict2D, {
          functions: [sigmoidActivation.activate],
          immutable: true,
          output: [3, 4],
        });
        expect(makeKernel).toHaveBeenCalledWith(compare2D, {
          functions: [sigmoidActivation.measure],
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
        const l = new Sigmoid(mockInputLayer);
        expect(l.predictKernel).toBe(null);
        expect(l.compareKernel).toBe(null);
        l.setupKernels();
        expect(l.predictKernel).not.toBe(null);
        expect(l.compareKernel).not.toBe(null);
        expect(makeKernel).toHaveBeenCalledWith(predict3D, {
          functions: [sigmoidActivation.activate],
          immutable: true,
          output: [3, 4, 5],
        });
        expect(makeKernel).toHaveBeenCalledWith(compare3D, {
          functions: [sigmoidActivation.measure],
          immutable: true,
          output: [3, 4, 5],
        });
      });
    });
  });

  describe('.predict()', () => {
    it('calls this.predictKernel() with this.inputLayer.weights', () => {
      const mockWeights = [[new Float32Array(1)]];
      const mockInputLayer = mockLayer({
        weights: mockWeights,
        width: 1,
        height: 1,
        depth: 1,
      });
      const l = new Sigmoid(mockInputLayer);
      (l as any).predictKernel = jest.fn((weights) => weights);
      l.predict();
      expect(l.predictKernel).toBeCalledWith(mockWeights);
      expect(l.weights).toBe(mockWeights);
    });
  });

  describe('.compare()', () => {
    it('calls this.compareKernel() with this.inputLayer.weights & this.inputLayer.deltas', () => {
      const mockWeights = [[new Float32Array(1)]];
      const mockDeltas = [[new Float32Array(1)]];
      const mockInputLayer = mockLayer({
        width: 1,
        height: 1,
        depth: 1,
      });
      const l = new Sigmoid(mockInputLayer);
      l.weights = mockWeights;
      l.deltas = mockDeltas;
      (l as any).compareKernel = jest.fn((weights, deltas) => deltas);
      l.compare();
      expect(l.compareKernel).toBeCalledWith(mockWeights, mockDeltas);
      expect(l.deltas).toBe(mockDeltas);
    });
  });

  describe('sigmoid lambda', () => {
    test('creates a new instance of Sigmoid and uses settings', () => {
      const width = 3;
      const height = 4;
      const depth = 5;
      const mockInputLayer = mockLayer({ width, height, depth });
      const mockPraxisInstance = mockPraxis(mockInputLayer);
      const settings: ILayerSettings = { initPraxis: () => mockPraxisInstance };
      const l = sigmoid(mockInputLayer, settings);
      expect(l.constructor).toBe(Sigmoid);
      expect(l.width).toBe(width);
      expect(l.height).toBe(height);
      expect(l.depth).toBe(depth);
      expect(l.praxis).toBe(mockPraxisInstance);
    });
  });
});
