const { GPU } = require('gpu.js');
const { gpuMock } = require('gpu-mock.js');
const {
  ArthurDeviationBiases,
  arthurDeviationBiases,
  update,
} = require('../../../src/praxis/arthur-deviation-biases');
const { shave } = require('../../test-utils');
const { setup, teardown } = require('../../../src/utilities/kernel');
const { injectIstanbulCoverage } = require('../../test-utils');

describe('ArthurDeviationBiases Class: Unit', () => {
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
      const weights = [[1, 2, 3]];
      const deltas = [[0.5, 0.4, 0.3]];
      const width = 3;
      const height = 1;
      const kernel = gpuMock(update, {
        output: [width, height],
        constants: {
          learningRate: 0.5,
          momentum: 0.2,
        },
      });
      const result = kernel(weights, deltas);
      expect(shave(result)).toEqual(shave([[1.25, 2.20000005, 3.1500001]]));
    });
  });

  describe('.constructor()', () => {
    test('calls this.setupKernels()', () => {
      const p = new ArthurDeviationBiases({ width: 2, height: 2 });
      expect(p.kernel).not.toBe(null);
    });
  });

  describe('.run()', () => {
    it('calls this.kernel() returns kernel output', () => {
      const mockWeights = 1;
      const mockDeltas = 2;
      const mockLayer = {
        width: 2,
        height: 2,
        deltas: mockDeltas,
        weights: mockWeights,
      };
      const p = new ArthurDeviationBiases(mockLayer);
      const mockResult = {};
      p.kernel = jest.fn(() => mockResult);
      const result = p.run(mockLayer);
      expect(result).toBe(mockResult);
      expect(p.kernel).toHaveBeenCalledWith(mockWeights, mockDeltas);
    });
  });

  describe('arthurDeviationBiases lambda', () => {
    it('creates a new instance of ArthurDeviationBiases', () => {
      const mockLayer = {};
      const p = arthurDeviationBiases(mockLayer);
      expect(p.layerTemplate).toBe(mockLayer);
    });
  });
});
