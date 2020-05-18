const { GPU } = require('gpu.js');
const { gpuMock } = require('gpu-mock.js');

const {
  dropout,
  Dropout,
  trainingPredict,
  predict,
  compare,
  setDropout,
} = require('../../src/layer/dropout');
const { setup, teardown, makeKernel } = require('../../src/utilities/kernel');
const { injectIstanbulCoverage } = require('../test-utils');

jest.mock('../../src/utilities/kernel');

describe('Dropout Layer', () => {
  beforeEach(() => {
    setup(
      new GPU({
        mode: 'cpu',
        onIstanbulCoverageVariable: injectIstanbulCoverage,
      })
    );
    jest.spyOn(Dropout.prototype, 'validate');
  });
  afterEach(() => {
    teardown();
    Dropout.prototype.validate.mockRestore();
  });
  describe('dropout', () => {
    it('sends inputLayer and settings through and instantiates a Dropout', () => {
      const mockInputLayer = {};
      const settings = {
        probability: 100,
      };
      const layer = dropout(mockInputLayer, settings);
      expect(layer.constructor).toBe(Dropout);
      expect(layer.probability).toBe(settings.probability);
    });
  });
  describe('.constructor', () => {
    it('sets inputLayer', () => {
      const mockInputLayer = {};
      const layer = new Dropout(mockInputLayer);
      expect(layer.inputLayer).toBe(mockInputLayer);
    });
    it('sets height & width from inputLayer', () => {
      const mockInputLayer = {
        width: 1,
        height: 2,
      };
      const layer = new Dropout(mockInputLayer);
      expect(layer.width).toBe(mockInputLayer.width);
      expect(layer.height).toBe(mockInputLayer.height);
    });
    it('sets probability from settings', () => {
      const mockInputLayer = {};
      const settings = {
        probability: 123,
      };
      const layer = new Dropout(mockInputLayer, settings);
      expect(layer.probability).toBe(settings.probability);
    });
    it('calls this.validate', () => {
      const mockInputLayer = {};
      const settings = {
        probability: 123,
      };
      // eslint-disable-next-line no-new
      new Dropout(mockInputLayer, settings);
      expect(Dropout.prototype.validate).toHaveBeenCalled();
    });
    it('sets dropouts to null', () => {
      const mockInputLayer = {};
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
      })(inputs);

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
        const mockInstance = {
          width: 1,
          height: 2,
          predictKernel: null,
        };
        Dropout.prototype.setupKernels.call(mockInstance, true);
        expect(makeKernel).toHaveBeenCalledWith(trainingPredict, {
          output: [1, 2],
          map: { dropouts: setDropout },
        });
        expect(mockInstance.predictKernel).not.toBe(null);
      });
      it('this.compareKernel should be set', () => {
        const mockInstance = {
          width: 1,
          height: 2,
          compareKernel: null,
        };
        Dropout.prototype.setupKernels.call(mockInstance, true);
        expect(makeKernel).toHaveBeenCalledWith(compare, { output: [1, 2] });
        expect(mockInstance.compareKernel).not.toBe(null);
      });
    });
    describe('isTraining is false', () => {
      it('this.predictKernel should be set', () => {
        const mockInstance = {
          width: 1,
          height: 2,
          predictKernel: null,
        };
        Dropout.prototype.setupKernels.call(mockInstance, false);
        expect(makeKernel).toHaveBeenCalledWith(predict, { output: [1, 2] });
        expect(mockInstance.predictKernel).not.toBe(null);
      });
    });
  });
  describe('.predict', () => {
    let mockPredictKernel;
    let mockInputLayer;
    let mockInstance;
    const mockResult = 'result';
    const mockDropouts = 'dropout';
    beforeEach(() => {
      mockPredictKernel = jest.fn(() => {
        return {
          result: mockResult,
          dropouts: mockDropouts,
        };
      });
      mockInputLayer = {
        weights: {},
      };
      mockInstance = {
        predictKernel: mockPredictKernel,
        inputLayer: mockInputLayer,
      };
    });
    it('calls this.predictKernel with this.inputLayer.weights', () => {
      Dropout.prototype.predict.call(mockInstance);
      expect(mockPredictKernel).toHaveBeenCalledWith(mockInputLayer.weights);
    });
    it('sets this.weights from result', () => {
      Dropout.prototype.predict.call(mockInstance);
      expect(mockInstance.weights).toBe(mockResult);
    });
    it('sets this.dropouts from dropouts', () => {
      Dropout.prototype.predict.call(mockInstance);
      expect(mockInstance.dropouts).toBe(mockDropouts);
    });
  });
  describe('.compare', () => {
    let mockCompareKernel;
    const mockDropouts = 'dropouts';
    const mockDeltas = 'deltas';
    const mockResult = 'result';
    let mockInstance;
    beforeEach(() => {
      mockCompareKernel = jest.fn(() => mockResult);
      mockInstance = {
        compareKernel: mockCompareKernel,
        dropouts: mockDropouts,
        inputLayer: { deltas: mockDeltas },
      };
    });
    it('calls this.compareKernel with this.dropouts and this.inputLayer.deltas', () => {
      Dropout.prototype.compare.call(mockInstance);
      expect(mockCompareKernel).toBeCalledWith(mockDropouts, mockDeltas);
    });
    it('sets this.deltas', () => {
      Dropout.prototype.compare.call(mockInstance);
      expect(mockInstance.deltas).toBe(mockResult);
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
