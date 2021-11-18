import { GPU } from 'gpu.js';
import { gpuMock } from 'gpu-mock.js';

import {
  dropout,
  Dropout,
  trainingPredict,
  predict,
  compare,
  setDropout,
  IDropoutSettings,
} from './dropout';
import {
  setup,
  teardown,
  makeKernel,
  makeKernelMap,
} from '../utilities/kernel';
import {
  IWithCompareKernel,
  IWithPredictKernelMap,
  mockLayer,
} from '../test-utils';

jest.mock('../utilities/kernel');

describe('Dropout Layer', () => {
  let validateMock: jest.SpyInstance;
  beforeEach(() => {
    setup(
      new GPU({
        mode: 'cpu',
      })
    );
    validateMock = jest.spyOn(Dropout.prototype, 'validate');
  });
  afterEach(() => {
    teardown();
    validateMock.mockRestore();
  });
  describe('dropout', () => {
    it('sends inputLayer and settings through and instantiates a Dropout', () => {
      const mockInputLayer = mockLayer({});
      const settings: IDropoutSettings = {
        probability: 100,
      };
      const layer = dropout(mockInputLayer, settings);
      expect(layer.constructor).toBe(Dropout);
      expect(layer.settings.probability).toBe(settings.probability);
    });
  });
  describe('.constructor', () => {
    it('sets inputLayer', () => {
      const mockInputLayer = mockLayer({});
      const layer = new Dropout(mockInputLayer);
      expect(layer.inputLayer).toBe(mockInputLayer);
    });
    it('sets height & width from inputLayer', () => {
      const mockInputLayer = mockLayer({
        width: 1,
        height: 2,
      });
      const layer = new Dropout(mockInputLayer);
      expect(layer.width).toBe(mockInputLayer.width);
      expect(layer.height).toBe(mockInputLayer.height);
    });
    it('sets probability from settings', () => {
      const mockInputLayer = mockLayer({});
      const settings: IDropoutSettings = {
        probability: 123,
      };
      const layer = new Dropout(mockInputLayer, settings);
      expect(layer.settings.probability).toBe(settings.probability);
    });
    it('calls this.validate', () => {
      const mockInputLayer = mockLayer({});
      const settings: IDropoutSettings = {
        probability: 123,
      };
      // eslint-disable-next-line no-new
      new Dropout(mockInputLayer, settings);
      expect(validateMock).toHaveBeenCalled();
    });
    it('sets dropouts to null', () => {
      const mockInputLayer = mockLayer({});
      const layer = new Dropout(mockInputLayer);
      expect(layer.dropouts).toBe(null);
    });
  });
  describe('trainingPredict (forward propagation)', () => {
    test('can dropout a simple matrix', () => {
      const inputs = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];

      const results = gpuMock(trainingPredict, {
        output: [3, 3],
        constants: {
          probability: 0.5,
        },
      })(inputs) as number[][];

      let hasZero = false;
      let hasNumber = false;

      for (let y = 0; y < results.length; y++) {
        const row = results[y];
        for (let x = 0; x < row.length; x++) {
          const value = row[x];
          if (value === 0) {
            hasZero = true;
          } else if (!Number.isNaN(value)) {
            hasNumber = true;
          }
        }
      }

      expect(hasZero).toBeTruthy();
      expect(hasNumber).toBeTruthy();
    });
  });
  describe('.training (forward propagation)', () => {
    test('can dropout a simple matrix', () => {
      const inputs = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];

      const results = gpuMock(predict, {
        output: [3, 3],
        constants: {
          probability: 0.5,
        },
      })(inputs);

      expect(results).toEqual([
        new Float32Array([0.5, 1, 1.5]),
        new Float32Array([2, 2.5, 3]),
        new Float32Array([3.5, 4, 4.5]),
      ]);
    });
  });

  describe('.setupKernels', () => {
    describe('isTraining is true', () => {
      it('this.predictKernel should be set', () => {
        const inputLayer = mockLayer({ height: 2, width: 1 });
        const layer = new Dropout(inputLayer);
        layer.setupKernels(true);
        expect(makeKernelMap).toHaveBeenCalledWith(
          { dropouts: setDropout },
          trainingPredict,
          {
            output: [1, 2],
            immutable: true,
          }
        );
        expect(layer.predictKernelMap).not.toBe(null);
      });
      it('this.compareKernel should be set', () => {
        const inputLayer = mockLayer({ height: 2, width: 1 });
        const layer = new Dropout(inputLayer);
        layer.setupKernels(true);
        expect(makeKernel).toHaveBeenCalledWith(compare, {
          output: [1, 2],
          immutable: true,
        });
        expect(layer.compareKernel).not.toBe(null);
      });
    });
    describe('isTraining is false', () => {
      it('this.predictKernelMap should be set', () => {
        const inputLayer = mockLayer({ width: 1, height: 2 });
        const layer = new Dropout(inputLayer);
        layer.setupKernels(false);
        expect(makeKernelMap).toHaveBeenCalledWith({}, predict, {
          output: [1, 2],
          immutable: true,
        });
        expect(layer.predictKernelMap).not.toBe(null);
      });
    });
  });
  describe('.predict', () => {
    it('calls this.predictKernelMap with this.inputLayer.weights', () => {
      const inputLayer = mockLayer({ weights: [[[0]]] });
      const layer = new Dropout(inputLayer);
      const spy = (((layer as unknown) as IWithPredictKernelMap).predictKernelMap = jest.fn(
        () => {
          return [1];
        }
      ));
      layer.predict();
      expect(spy).toHaveBeenCalledWith(inputLayer.weights);
    });
    it('sets this.weights from result', () => {
      const inputLayer = mockLayer({ weights: [[[0]]] });
      const layer = new Dropout(inputLayer);
      const weights = [[[1]]];
      ((layer as unknown) as IWithPredictKernelMap).predictKernelMap = jest.fn(
        () => {
          return {
            result: weights,
          };
        }
      );
      layer.predict();
      expect(layer.weights).toBe(weights);
    });
    it('sets this.dropouts from dropouts', () => {
      const inputLayer = mockLayer({ weights: [[[0]]] });
      const layer = new Dropout(inputLayer);
      const dropouts = [[[1]]];
      ((layer as unknown) as IWithPredictKernelMap).predictKernelMap = jest.fn(
        () => {
          return {
            dropouts: dropouts,
          };
        }
      );
      layer.predict();
      expect(layer.dropouts).toBe(dropouts);
    });
  });
  describe('.compare', () => {
    it('calls this.compareKernel with this.dropouts and this.inputLayer.deltas', () => {
      const inputLayer = mockLayer({ width: 1, height: 2 });
      const layer = new Dropout(inputLayer);
      const dropouts = (layer.dropouts = [1]);
      const inputLayerDeltas = (inputLayer.deltas = [42]);
      const compareKernel = (((layer as unknown) as IWithCompareKernel).compareKernel = jest.fn());
      layer.compare();
      expect(compareKernel).toBeCalledWith(dropouts, inputLayerDeltas);
    });
    it('sets this.deltas', () => {
      const inputLayer = mockLayer({ width: 1, height: 2 });
      const layer = new Dropout(inputLayer);
      const expectedResult = [42];
      ((layer as unknown) as IWithCompareKernel).compareKernel = jest.fn(() => {
        return expectedResult;
      });
      layer.compare();
      expect(layer.deltas).toBe(expectedResult);
    });
  });

  describe('compare', () => {
    test('output', () => {
      const results = gpuMock(compare, {
        output: [3, 3],
        constants: {
          probability: 0.5,
        },
      })(
        [
          [1, 0, 1],
          [0, 1, 0],
          [1, 1, 1],
        ],
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ]
      );
      expect(results).toEqual([
        new Float32Array([1, 0, 3]),
        new Float32Array([0, 5, 0]),
        new Float32Array([7, 8, 9]),
      ]);
    });
  });
});
