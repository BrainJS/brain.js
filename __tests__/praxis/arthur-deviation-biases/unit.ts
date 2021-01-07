import { GPU } from 'gpu.js';
import { gpuMock } from 'gpu-mock.js';
import {
  ArthurDeviationBiases,
  arthurDeviationBiases,
  update,
} from '../../../src/praxis/arthur-deviation-biases';
import { shave } from '../../test-utils';
import { setup, teardown } from '../../../src/utilities/kernel';

describe('ArthurDeviationBiases Class: Unit', () => {
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

      const result = kernel(weights, deltas) as Float32Array;
      const value = new Float32Array([1.25, 2.20000005, 3.1500001]);
      expect(shave(result)).toEqual(shave(value));
    });
  });

  describe('.setupKernels()', () => {
    test('instantiates .kernel', () => {
      const mockLayer: any = { width: 2, height: 2 };
      const p = new ArthurDeviationBiases(mockLayer);
      p.setupKernels();
      expect(p.kernel).not.toBe(null);
    });
  });

  describe('.run()', () => {
    it('calls this.kernel() returns kernel output', () => {
      const mockWeights = 1;
      const mockDeltas = 2;
      const mockLayer: any = {
        width: 2,
        height: 2,
        deltas: mockDeltas,
        weights: mockWeights,
      };
      const p: any = new ArthurDeviationBiases(mockLayer);
      const mockResult = {};
      p.kernel = jest.fn(() => mockResult);
      const result = p.run(mockLayer, NaN);
      expect(result).toBe(mockResult);
      expect(p.kernel).toHaveBeenCalledWith(mockWeights, mockDeltas);
    });
  });

  describe('arthurDeviationBiases lambda', () => {
    it('creates a new instance of ArthurDeviationBiases', () => {
      const mockLayer: any = {};
      const p = arthurDeviationBiases(mockLayer);
      expect(p.layerTemplate).toBe(mockLayer);
    });
  });
});
