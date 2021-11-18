import { Activation } from './activation';
import { ILayerSettings } from './base-layer';
import { mockPraxis, mockLayer } from '../test-utils';

describe('Activation Abstract Layer', () => {
  describe('.constructor()', () => {
    describe('calls .validate()', () => {
      let mockValidate: jest.SpyInstance;
      beforeEach(() => {
        mockValidate = jest.spyOn(Activation.prototype, 'validate');
      });
      afterEach(() => {
        mockValidate.mockRestore();
      });
      test('.validate() call', () => {
        const mockInputLayer = mockLayer({
          width: 1,
          height: 1,
          weights: [new Float32Array(1).fill(1)],
          deltas: [new Float32Array(1)],
        });
        const praxis = mockPraxis(mockInputLayer);
        const l = new Activation(mockInputLayer, {
          praxis,
        });
        expect(l.validate).toBeCalled();
      });
    });
    test('inputLayer', () => {
      const mockInputLayer = mockLayer({
        width: 1,
        height: 1,
        weights: [new Float32Array(1).fill(1)],
        deltas: [new Float32Array(1)],
      });
      const l = new Activation(mockInputLayer);
      expect(l.inputLayer).toBe(mockInputLayer);
    });
    test('dimensions', () => {
      const width = 3;
      const height = 4;
      const depth = 5;
      const testInputLayer = mockLayer({ width, height, depth });
      const l = new Activation(testInputLayer);
      expect(l.width).toBe(width);
      expect(l.height).toBe(height);
      expect(l.depth).toBe(depth);
    });
    test('2d weights & deltas', () => {
      const width = 3;
      const height = 4;
      const testInputLayer = mockLayer({ width, height });
      const l = new Activation(testInputLayer);
      const weights = l.weights as Float32Array[];
      expect(weights.length).toBe(height);
      expect(weights[0].length).toBe(width);
      expect(typeof weights[0][0]).toBe('number');
    });
    test('3d weights & deltas', () => {
      const width = 3;
      const height = 4;
      const depth = 5;
      const testInputLayer = mockLayer({ width, height, depth });
      const l = new Activation(testInputLayer);
      const weights = l.weights as Float32Array[][];
      expect(weights.length).toBe(depth);
      expect(weights[0].length).toBe(height);
      expect(weights[0][0].length).toBe(width);
      expect(typeof weights[0][0][0]).toBe('number');
    });
    test('initPraxis', () => {
      const mockPraxisInstance = mockPraxis(mockLayer({}));
      const mockInitPraxis = jest.fn(() => mockPraxisInstance);
      const settings: ILayerSettings = {
        initPraxis: mockInitPraxis,
        praxisOpts: {},
      };
      const mockInputLayer = mockLayer({
        width: 1,
        height: 1,
      });
      const l = new Activation(mockInputLayer, settings);
      expect(mockInitPraxis).toBeCalled();
      expect(l.praxis).toBe(mockPraxisInstance);
    });
  });
});
