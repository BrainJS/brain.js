import { gpuMock } from 'gpu-mock.js';
import { GPU, IKernelRunShortcut } from 'gpu.js';
import {
  ArthurDeviationBiases,
  arthurDeviationBiases,
  update,
} from '../praxis/arthur-deviation-biases';
import { setup, teardown } from '../utilities/kernel';
import { mockLayer, shave } from '../test-utils';

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

      const result = kernel(weights, deltas) as Float32Array[];
      const value = new Float32Array([1.25, 2.20000005, 3.1500001]);

      expect(shave(result[0])).toEqual(shave(value));
    });
  });

  describe('.setupKernels()', () => {
    test('instantiates .kernel', () => {
      const layer = mockLayer({ width: 2, height: 2 });
      const p = new ArthurDeviationBiases(layer);
      p.setupKernels();
      expect(p.kernel).not.toBe(null);
    });
  });

  describe('.run()', () => {
    it('calls this.kernel() returns kernel output', () => {
      const mockWeights = 1;
      const mockDeltas = 2;
      const layer = mockLayer({
        width: 2,
        height: 2,
        deltas: mockDeltas,
        weights: mockWeights,
      });
      const p = new ArthurDeviationBiases(layer);
      interface I {
        kernel: IKernelRunShortcut;
      }
      p.setupKernels();
      const kernelSpy = jest.spyOn(p as I, 'kernel');
      const mockResult = [[1]];
      kernelSpy.mockReturnValue(mockResult);
      const result = p.run(layer);
      expect(result).toBe(mockResult);
      expect(p.kernel).toHaveBeenCalledWith(mockWeights, mockDeltas);
    });
  });

  describe('arthurDeviationBiases lambda', () => {
    it('creates a new instance of ArthurDeviationBiases', () => {
      const layer = mockLayer({ width: 1, height: 1 });
      const p = arthurDeviationBiases(layer);
      expect(p.layerTemplate).toBe(layer);
    });
  });
});
