import {
  Add,
  Convolution,
  ILayerJSON,
  RecurrentZeros,
  Sigmoid,
  Target,
} from '../../src/layer';
import { layerFromJSON } from '../../src/utilities/layer-from-json';
import { mockLayer } from '../test-utils';

describe('layerFromJSON', () => {
  it('should return null when type is specified in a wrong way', () => {
    const jsonLayer: ILayerJSON = {
      width: 5,
      height: 5,
      depth: 2,
      weights: null,
      type: 'WrongType',
      praxisOpts: null,
    };

    expect(layerFromJSON(jsonLayer)).toBe(null);
  });

  describe('when used with a Filter layer json', () => {
    const jsonLayer = {
      width: 1,
      height: 1,
      depth: 1,
      type: 'Convolution',
      praxisOpts: null,
      stride: 1,
      filters: [[[1]]],
      weights: [[[2]]],
      biasDeltas: [[[3]]],
    };
    it('fails if inputLayer falsey', () => {
      expect(() => layerFromJSON(jsonLayer)).toThrow('inputLayer missing');
    });
    it('should return that type instantiated', () => {
      const inputLayer = mockLayer({
        width: 1,
        height: 1,
        depth: 1,
      });
      expect(layerFromJSON(jsonLayer, inputLayer)).toEqual(
        new Convolution(jsonLayer, inputLayer)
      );
    });
  });
  describe('when used with a Activation layer json', () => {
    const jsonLayer: ILayerJSON = {
      width: 5,
      height: 5,
      weights: null,
      type: 'Sigmoid',
      praxisOpts: null,
    };
    it('fails if inputLayer1 falsey', () => {
      expect(() => layerFromJSON(jsonLayer)).toThrow('inputLayer missing');
    });
    it('should return that type instantiated', () => {
      const inputLayer1 = mockLayer();
      expect(layerFromJSON(jsonLayer, inputLayer1)).toEqual(
        new Sigmoid(inputLayer1, jsonLayer)
      );
    });
  });
  describe('when used with a Operator layer json', () => {
    const jsonLayer: ILayerJSON = {
      width: 5,
      height: 5,
      weights: null,
      type: 'RecurrentZeros',
      praxisOpts: null,
    };
    it('should return that type instantiated', () => {
      expect(layerFromJSON(jsonLayer)).toEqual(new RecurrentZeros(jsonLayer));
    });
  });
  describe('when used with a Operator layer json', () => {
    const jsonLayer: ILayerJSON = {
      width: 5,
      height: 5,
      weights: null,
      type: 'Add',
      praxisOpts: null,
    };
    it('fails if inputLayer1 falsey', () => {
      expect(() => layerFromJSON(jsonLayer)).toThrow('inputLayer1 missing');
    });
    it('fails if inputLayer2 falsey', () => {
      const inputLayer1 = mockLayer();
      expect(() => layerFromJSON(jsonLayer, inputLayer1)).toThrow(
        'inputLayer2 missing'
      );
    });
    it('should return that type instantiated', () => {
      const inputLayer1 = mockLayer();
      const inputLayer2 = mockLayer();
      expect(layerFromJSON(jsonLayer, inputLayer1, inputLayer2)).toEqual(
        new Add(inputLayer1, inputLayer2, jsonLayer)
      );
    });
  });
  describe('when used with a TargetType layer json', () => {
    const jsonLayer: ILayerJSON = {
      width: 5,
      height: 5,
      weights: null,
      type: 'Target',
      praxisOpts: null,
    };
    it('fails if inputLayer falsey', () => {
      expect(() => layerFromJSON(jsonLayer)).toThrow('inputLayer missing');
    });
    it('should return that type instantiated', () => {
      const inputLayer = mockLayer();
      expect(layerFromJSON(jsonLayer, inputLayer)).toEqual(
        new Target(jsonLayer, inputLayer)
      );
    });
  });
});
