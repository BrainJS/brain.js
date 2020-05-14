const { GPU } = require('gpu.js');
const { gpuMock } = require('gpu-mock.js');

const { predict, Add, add } = require('../../src/layer/add');
const {
  setup,
  teardown,
  makeKernel,
  release,
} = require('../../src/utilities/kernel');
const { checkSameSize } = require('../../src/utilities/layer-size');
const { injectIstanbulCoverage } = require('../test-utils');

jest.mock('../../src/utilities/layer-size');
jest.mock('../../src/utilities/kernel');

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
    beforeEach(() => {
      jest.spyOn(Add.prototype, 'validate');
      jest.spyOn(Add.prototype, 'setupPraxis');
    });
    afterEach(() => {
      Add.prototype.validate.mockRestore();
      Add.prototype.setupPraxis.mockRestore();
    });
    it('sets up the instance', () => {
      const mockInputLayer1 = {
        width: 1,
        height: 1,
      };
      const mockInputLayer2 = {
        width: 1,
        height: 1,
      };
      const settings = {};
      const add = new Add(mockInputLayer1, mockInputLayer2, settings);
      expect(add.inputLayer1).toBe(mockInputLayer1);
      expect(add.inputLayer2).toBe(mockInputLayer2);
      expect(add.validate).toBeCalled();
      expect(add.setupPraxis).toBeCalledWith(settings);
    });
  });
  describe('.predict (forward propagation)', () => {
    test('releases this.weights', () => {
      const add = new Add({ width: 1, height: 1 }, { width: 1, height: 1 });
      add.predictKernel = () => {};
      const mockWeights = (add.weights = {});
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
    it('sets this.inputLayer1.deltas & this.inputLayer2.deltas from this.deltas', () => {
      const mockDeltas = {};
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
      expect(mockInstance.inputLayer1.deltas).toBe(mockDeltas);
      expect(mockInstance.inputLayer2.deltas).toBe(mockDeltas);
    });
  });
  describe('add()', () => {
    beforeEach(() => {
      jest.spyOn(Add.prototype, 'setupPraxis');
    });
    afterEach(() => {
      Add.prototype.setupPraxis.mockRestore();
    });
    it('instantiates Add with inputLayer1, inputLayer2, and settings', () => {
      const mockInputLayer1 = {
        width: 1,
        height: 1,
      };
      const mockInputLayer2 = {
        width: 1,
        height: 1,
      };
      const settings = {};
      const layer = add(mockInputLayer1, mockInputLayer2, settings);
      expect(layer.inputLayer1).toBe(mockInputLayer1);
      expect(layer.inputLayer2).toBe(mockInputLayer2);
      expect(layer.setupPraxis).toBeCalledWith(settings);
    });
  });
});
