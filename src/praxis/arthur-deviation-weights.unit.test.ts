import { GPU, IKernelRunShortcut } from 'gpu.js';
import { gpuMock } from 'gpu-mock.js';
import {
  ArthurDeviationWeights,
  arthurDeviationWeights,
  IArthurDeviationWeightsSettings,
  update,
  updateChange,
} from './arthur-deviation-weights';
import { setup, teardown } from '../utilities/kernel';
import { mockLayer, shave, shave2D } from '../test-utils';

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
      const result = kernel(
        changes,
        weights,
        incomingWeights,
        inputDeltas
      ) as Float32Array[];
      // Corrected this array, need to recheck
      const value: Float32Array = new Float32Array([
        1.70000005,
        3.4000001,
        5.0999999,
      ]);
      expect(shave2D(result)).toEqual([shave(value)]);
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
        const layer = mockLayer({ width, height });
        const p = new ArthurDeviationWeights(layer);
        const changes = p.changes as number[][];
        expect(changes.length).toBe(height);
        expect(changes[0].length).toBe(width);
      });
    });
    describe('.weightsLayer', () => {
      const layer = mockLayer({ width: 1, height: 1 });
      const weightsLayer = mockLayer({});
      const p = new ArthurDeviationWeights(layer, {
        weightsLayer,
      });
      expect(p.weightsLayer).toBe(weightsLayer);
    });
    describe('.incomingLayer', () => {
      const layer = mockLayer({ width: 1, height: 1 });
      const incomingLayer = mockLayer({ width: 1, height: 1 });
      const p = new ArthurDeviationWeights(layer, {
        incomingLayer,
      });
      expect(p.incomingLayer).toBe(incomingLayer);
    });
    describe('.deltaLayer', () => {
      const layer = mockLayer({ width: 1, height: 1 });
      const deltaLayer = mockLayer({ width: 1, height: 1 });
      const p = new ArthurDeviationWeights(layer, {
        deltaLayer,
      });
      expect(p.deltaLayer).toBe(deltaLayer);
    });
  });

  describe('.run()', () => {
    it('calls this.kernel(), sets this.changes, and returns kernel output.results', () => {
      const layer = mockLayer({ width: 1, height: 1, weights: [[1]] });
      const weightsLayer = mockLayer({ width: 1, height: 1, weights: [[2]] });
      const incomingLayer = mockLayer({ width: 1, height: 1, weights: [[3]] });
      const deltaLayer = mockLayer({ width: 1, height: 1, deltas: [[4]] });
      const p: ArthurDeviationWeights = new ArthurDeviationWeights(layer, {
        weightsLayer,
        incomingLayer,
        deltaLayer,
      });
      p.setupKernels();
      const oldChanges = p.changes;
      const result = p.run();
      expect(result).toBeInstanceOf(Array);
      expect(p.changes).not.toBe(oldChanges);
    });
  });

  describe('arthurDeviationWeights lambda', () => {
    it('creates a new instance of ArthurDeviationWeights', () => {
      const layer = mockLayer({ height: 1, width: 1 });
      const weightsLayer = mockLayer({ height: 1, width: 1 });
      const deltaLayer = mockLayer({ height: 1, width: 1 });
      const incomingLayer = mockLayer({ height: 1, width: 1 });
      const settings: Partial<IArthurDeviationWeightsSettings> = {
        weightsLayer,
        deltaLayer,
        incomingLayer,
      };
      const p = arthurDeviationWeights(layer, settings);
      expect(p.weightsLayer).toBe(weightsLayer);
      expect(p.deltaLayer).toBe(deltaLayer); // deltasLayer did not exist, so changed to deltaLayer
      expect(p.incomingLayer).toBe(incomingLayer);
      expect(p.layerTemplate).toBe(layer);
    });
  });
});
