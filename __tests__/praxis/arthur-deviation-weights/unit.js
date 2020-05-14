const { GPU } = require('gpu.js');
const { gpuMock } = require('gpu-mock.js');
const {
  ArthurDeviationWeights,
  arthurDeviationWeights,
  update,
  updateChange,
} = require('../../../src/praxis/arthur-deviation-weights');
const { shave } = require('../../test-utils');
const { setup, teardown } = require('../../../src/utilities/kernel');
const { injectIstanbulCoverage } = require('../../test-utils');

describe('ArthurDeviationWeights Class: Unit', () => {
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
  describe('update()', () => {
    it('performs math correctly', () => {
      const changes = [[1, 2, 3]];
      const weights = [[1, 2, 3]];
      const incomingWeights = [[1], [2], [3]];
      const inputDeltas = [[1]];
      const width = 3;
      const height = 1;
      const kernel = gpuMock(update, {
        output: [width, height],
        constants: {
          learningRate: 0.5,
          momentum: 0.2,
        },
      });
      const result = kernel(changes, weights, incomingWeights, inputDeltas);
      expect(shave(result)).toEqual(
        shave([[1.70000005, 3.4000001, 5.0999999]])
      );
    });
  });
  describe('updateChange()', () => {
    it('returns the value it is given', () => {
      const mockValue = {};
      expect(updateChange(mockValue)).toBe(mockValue);
    });
  });

  describe('.constructor()', () => {
    describe('.changes', () => {
      it('gets dimensions from inputLayer', () => {
        const width = 2;
        const height = 3;
        const mockLayer = {
          width,
          height,
        };
        const p = new ArthurDeviationWeights(mockLayer);
        expect(p.changes.length).toBe(height);
        expect(p.changes[0].length).toBe(width);
      });
    });
    describe('.weightsLayer', () => {
      const mockLayer = { width: 1, height: 1 };
      const weightsLayerMock = {};
      const p = new ArthurDeviationWeights(mockLayer, {
        weightsLayer: weightsLayerMock,
      });
      expect(p.weightsLayer).toBe(weightsLayerMock);
    });
    describe('.incomingLayer', () => {
      const mockLayer = { width: 1, height: 1 };
      const incomingLayerMock = {};
      const p = new ArthurDeviationWeights(mockLayer, {
        incomingLayer: incomingLayerMock,
      });
      expect(p.incomingLayer).toBe(incomingLayerMock);
    });
    describe('.deltaLayer', () => {
      const mockLayer = { width: 1, height: 1 };
      const deltaLayerMock = {};
      const p = new ArthurDeviationWeights(mockLayer, {
        deltaLayer: deltaLayerMock,
      });
      expect(p.deltaLayer).toBe(deltaLayerMock);
    });
  });

  describe('.run()', () => {
    it('calls this.kernel(), sets this.changes, and returns kernel output.results', () => {
      const mockLayer = { width: 2, height: 2 };
      const weightsLayerWeightsMock = {};
      const weightsLayerMock = { weights: weightsLayerWeightsMock };
      const incomingLayerWeightsMock = {};
      const incomingLayerMock = { weights: incomingLayerWeightsMock };
      const deltaLayerDeltasMock = {};
      const deltaLayerMock = { deltas: deltaLayerDeltasMock };
      const p = new ArthurDeviationWeights(mockLayer, {
        weightsLayer: weightsLayerMock,
        incomingLayer: incomingLayerMock,
        deltaLayer: deltaLayerMock,
      });
      const mockResult = {};
      const mockChanges = {};
      const mockInitialChanges = (p.changes = {});
      p.kernel = jest.fn(() => {
        return {
          result: mockResult,
          changes: mockChanges,
        };
      });
      const result = p.run();
      expect(result).toBe(mockResult);
      expect(p.kernel).toHaveBeenCalledWith(
        mockInitialChanges,
        weightsLayerWeightsMock,
        incomingLayerWeightsMock,
        deltaLayerDeltasMock
      );
    });
  });

  describe('arthurDeviationWeights lambda', () => {
    it('creates a new instance of ArthurDeviationWeights', () => {
      const mockLayer = {};
      const mockWeightsLayer = {};
      const mockDeltasLayer = {};
      const mockIncomingLayer = {};
      const settings = {
        weightsLayer: mockWeightsLayer,
        deltasLayer: mockDeltasLayer,
        incomingLayer: mockIncomingLayer,
      };
      const p = arthurDeviationWeights(mockLayer, settings);
      expect(p.weightsLayer).toBe(mockWeightsLayer);
      expect(p.deltasLayer).toBe(mockDeltasLayer);
      expect(p.incomingLayer).toBe(mockIncomingLayer);
      expect(p.layerTemplate).toBe(mockLayer);
    });
  });
});
