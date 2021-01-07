import { GPU, IKernelRunShortcut } from 'gpu.js';
import { gpuMock } from 'gpu-mock.js';
import {
  ArthurDeviationWeights,
  arthurDeviationWeights,
  IArthurDeviationWeightsSettings,
  update,
  updateChange,
} from '../../../src/praxis/arthur-deviation-weights';
import { setup, teardown } from '../../../src/utilities/kernel';
import { shave } from '../../test-utils';

describe('ArthurDeviationWeights Class: Unit', () => {
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
      const changes = [[1, 2, 3]];
      const weights = [[1, 2, 3]];
      const incomingWeights = [[1], [2], [3]];
      const inputDeltas = [[1]];
      const width = 3;
      const height = 1;
      const kernel: IKernelRunShortcut = gpuMock(update, {
        output: [width, height],
        constants: {
          learningRate: 0.5,
          momentum: 0.2,
        },
      });
      const result: any = kernel(
        changes,
        weights,
        incomingWeights,
        inputDeltas
      );
      // Corrected this array, need to recheck
      const value: Float32Array = new Float32Array([
        1.70000005,
        3.4000001,
        5.0999999,
      ]);
      expect(shave(result)).toEqual(shave(value));
    });
  });
  describe('updateChange()', () => {
    it('returns the value it is given', () => {
      const mockValue = 0;
      expect(updateChange(mockValue)).toBe(mockValue);
    });
  });

  describe('.constructor()', () => {
    describe('.changes', () => {
      it('gets dimensions from inputLayer', () => {
        const width = 2;
        const height = 3;
        const mockLayer: any = {
          width,
          height,
        };
        const p: any = new ArthurDeviationWeights(mockLayer);
        expect(p.changes.length).toBe(height);
        expect(p.changes[0].length).toBe(width);
      });
    });
    describe('.weightsLayer', () => {
      const mockLayer: any = { width: 1, height: 1 };
      const weightsLayerMock: any = {};
      const p = new ArthurDeviationWeights(mockLayer, {
        weightsLayer: weightsLayerMock,
      });
      expect(p.weightsLayer).toBe(weightsLayerMock);
    });
    describe('.incomingLayer', () => {
      const mockLayer: any = { width: 1, height: 1 };
      const incomingLayerMock: any = {};
      const p = new ArthurDeviationWeights(mockLayer, {
        incomingLayer: incomingLayerMock,
      });
      expect(p.incomingLayer).toBe(incomingLayerMock);
    });
    describe('.deltaLayer', () => {
      const mockLayer: any = { width: 1, height: 1 };
      const deltaLayerMock: any = {};
      const p = new ArthurDeviationWeights(mockLayer, {
        deltaLayer: deltaLayerMock,
      });
      expect(p.deltaLayer).toBe(deltaLayerMock);
    });
  });

  describe('.run()', () => {
    it('calls this.kernel(), sets this.changes, and returns kernel output.results', () => {
      const mockLayer: any = { width: 2, height: 2 };
      const weightsLayerWeightsMock = {};
      const weightsLayerMock: any = { weights: weightsLayerWeightsMock };
      const incomingLayerWeightsMock = {};
      const incomingLayerMock: any = { weights: incomingLayerWeightsMock };
      const deltaLayerDeltasMock = {};
      const deltaLayerMock: any = { deltas: deltaLayerDeltasMock };
      const p: any = new ArthurDeviationWeights(mockLayer, {
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
      const mockLayer: any = {};
      const mockWeightsLayer: any = {};
      const mockDeltasLayer: any = {};
      const mockIncomingLayer: any = {};
      const settings: Partial<IArthurDeviationWeightsSettings> = {
        weightsLayer: mockWeightsLayer,
        deltaLayer: mockDeltasLayer, // deltasLayer did not exist, so changed to deltaLayer
        incomingLayer: mockIncomingLayer,
      };
      const p = arthurDeviationWeights(mockLayer, settings);
      expect(p.weightsLayer).toBe(mockWeightsLayer);
      expect(p.deltaLayer).toBe(mockDeltasLayer); // deltasLayer did not exist, so changed to deltaLayer
      expect(p.incomingLayer).toBe(mockIncomingLayer);
      expect(p.layerTemplate).toBe(mockLayer);
    });
  });
});
