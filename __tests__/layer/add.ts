import { GPU } from 'gpu.js';
import { gpuMock } from 'gpu-mock.js';

import { predict, Add, add } from '../../src/layer/add';
import {
  setup,
  teardown,
  makeKernel,
  release,
} from '../../src/utilities/kernel';
import { checkSameSize } from '../../src/utilities/layer-size';
import { injectIstanbulCoverage, mockLayer, mockPraxis } from '../test-utils';

jest.mock('../../src/utilities/layer-size');
jest.mock('../../src/utilities/kernel', () => {
  return {
    makeKernel: jest.fn((fn) => () => [fn()]),
    setup: jest.fn(),
    release: jest.fn(),
    clear: jest.fn(),
    teardown: jest.fn(),
    clone: jest.fn((matrix: Float32Array[]) =>
      matrix.map((row: Float32Array) => row.slice(0))
    ),
  };
});

describe('Add Layer', () => {
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
  describe('.constructor', () => {
    let validateSpy: jest.SpyInstance;
    let setupPraxisSpy: jest.SpyInstance;
    beforeEach(() => {
      validateSpy = jest.spyOn(Add.prototype, 'validate');
      setupPraxisSpy = jest.spyOn(Add.prototype, 'setupPraxis');
    });
    afterEach(() => {
      validateSpy.mockRestore();
      setupPraxisSpy.mockRestore();
    });
    it('sets up the instance', () => {
      const mockInputLayer1 = mockLayer({ width: 1, height: 3 });
      const mockInputLayer2 = mockLayer({ width: 1, height: 3 });
      const praxis = mockPraxis(mockLayer({}));
      const settings = {
        praxis,
      };
      const add = new Add(mockInputLayer1, mockInputLayer2, settings);
      expect(add.inputLayer1).toBe(mockInputLayer1);
      expect(add.inputLayer2).toBe(mockInputLayer2);
      expect(add.validate).toBeCalled();
      expect(add.setupPraxis).toBeCalled();
      expect(add.width).toBe(1);
      expect(add.height).toBe(3);
    });
  });
  describe('.predict (forward propagation)', () => {
    test('releases this.weights', () => {
      const praxis = mockPraxis(mockLayer({}));
      const add = new Add(
        mockLayer({ width: 1, height: 1, weights: [new Float32Array(1)] }),
        mockLayer({ width: 1, height: 1, weights: [new Float32Array(1)] }),
        {
          praxis,
        }
      );
      add.predictKernel = makeKernel(
        function (weights1: number[][], weights2: number[][]) {
          return 1;
        },
        { output: [1, 1] }
      );
      const mockWeights = (add.weights = [new Float32Array(1)]);
      add.predict();
      expect(release).toHaveBeenCalledWith(mockWeights);
    });
    test('can add a simple matrix', () => {
      const inputs1 = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const inputs2 = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const results = gpuMock(predict, {
        output: [3, 3],
      })(inputs1, inputs2);

      expect(results).toEqual([
        new Float32Array([2, 4, 6]),
        new Float32Array([8, 10, 12]),
        new Float32Array([14, 16, 18]),
      ]);
    });
  });
  describe('.validate', () => {
    it('calls LayerSize.checkSameSize()', () => {
      const mockLayer1 = {
        height: 1,
        width: 1,
      };
      const mockLayer2 = {
        height: 1,
        width: 1,
      };
      Add.prototype.validate.apply({
        inputLayer1: mockLayer1,
        inputLayer2: mockLayer2,
      });
      expect(checkSameSize).toHaveBeenCalledWith(mockLayer1, mockLayer2);
    });
  });
  describe('.setupKernels', () => {
    it('defines this.predictKernel', () => {
      const mockInstance = {
        width: 1,
        height: 1,
        predictKernel: null,
      };
      Add.prototype.setupKernels.apply(mockInstance);
      expect(makeKernel).toHaveBeenCalledWith(predict, {
        output: [1, 1],
        immutable: true,
      });
      expect(mockInstance.predictKernel).not.toBe(null);
    });
  });
  describe('.predict', () => {
    it('calls this.predictKernel with correct arguments', () => {
      const mockWeights1 = {};
      const mockWeights2 = {};
      const mockPredictKernel = jest.fn();
      const mockInstance = {
        inputLayer1: { weights: mockWeights1 },
        inputLayer2: { weights: mockWeights2 },
        predictKernel: mockPredictKernel,
      };
      Add.prototype.predict.apply(mockInstance);
      expect(mockPredictKernel).toHaveBeenCalled();
    });
    it('defined this.weights from this.predictKernel', () => {
      const mockWeights1 = {};
      const mockWeights2 = {};
      const mockResult = {};
      const mockPredictKernel = () => mockResult;
      const mockInstance = {
        inputLayer1: { weights: mockWeights1 },
        inputLayer2: { weights: mockWeights2 },
        predictKernel: mockPredictKernel,
        weights: null,
      };
      Add.prototype.predict.apply(mockInstance);
      expect(mockInstance.weights).toBe(mockResult);
    });
  });
  describe('.compare', () => {
    beforeEach(() => {
      jest.unmock('../../src/utilities/kernel');
    });
    it('sets this.inputLayer1.deltas & this.inputLayer2.deltas from this.deltas', () => {
      const mockDeltas = [new Float32Array([1])];
      const mockInstance = {
        deltas: mockDeltas,
        inputLayer1: {
          deltas: null,
        },
        inputLayer2: {
          deltas: null,
        },
      };
      Add.prototype.compare.apply(mockInstance);
      expect(mockInstance.inputLayer1.deltas).toEqual(mockDeltas);
      expect(mockInstance.inputLayer2.deltas).toEqual(mockDeltas);
    });
  });
  describe('add()', () => {
    let setupPraxisMock: jest.SpyInstance;
    beforeEach(() => {
      setupPraxisMock = jest.spyOn(Add.prototype, 'setupPraxis');
    });
    afterEach(() => {
      setupPraxisMock.mockRestore();
    });
    it('instantiates Add with inputLayer1, inputLayer2, and settings', () => {
      const mockInputLayer1 = mockLayer({
        width: 1,
        height: 1,
      });
      const mockInputLayer2 = mockLayer({
        width: 1,
        height: 1,
      });
      const praxis = mockPraxis(mockLayer({}));
      const settings = {
        praxis,
      };
      const layer = add(mockInputLayer1, mockInputLayer2, settings);
      expect(layer.inputLayer1).toBe(mockInputLayer1);
      expect(layer.inputLayer2).toBe(mockInputLayer2);
      expect(layer.setupPraxis).toHaveBeenCalled();
    });
  });
});
