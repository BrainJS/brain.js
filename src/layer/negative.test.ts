import { gpuMock } from 'gpu-mock.js';
import { input } from './input';
import { Negative, predict } from './negative';
import { makeKernel } from '../utilities/kernel';
import { mockLayer } from '../test-utils';
jest.mock('../utilities/kernel', () => {
  return {
    makeKernel: jest.fn((fn, settings) => gpuMock(fn, settings)),
  };
});

describe('Negative Layer', () => {
  describe('.constructor()', () => {
    let validateSpy: jest.SpyInstance;
    beforeEach(() => {
      validateSpy = jest.spyOn(Negative.prototype, 'validate');
    });
    afterEach(() => {
      validateSpy.mockRestore();
    });
    it('calls .validate()', () => {
      // eslint-disable-next-line no-new
      new Negative(mockLayer({ width: 1, height: 1, depth: 0 }));
      expect(validateSpy).toHaveBeenCalled();
    });
  });
  describe('.setupKernels()', () => {
    it('sets this.predictKernel', () => {
      const layer = new Negative(input({ width: 1, height: 2 }));
      layer.setupKernels();
      expect(makeKernel).toHaveBeenCalledWith(predict, {
        output: [1, 2],
      });
    });
  });
  describe('.predict()', () => {
    let layer: Negative;
    beforeEach(() => {
      layer = new Negative(mockLayer({ width: 1, height: 1, depth: 0 }));
      layer.setupKernels();
    });
    it('sets this.weights from this.predictKernel()', () => {
      layer.inputLayer.weights = [[42]];
      layer.predict();
      expect(layer.weights).toEqual([Float32Array.from([-42])]);
    });
  });
});
