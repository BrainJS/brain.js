import { ILayerJSON } from '../../src/layer/base-layer';
import layerFromJSON from '../../src/utilities/layer-from-json';
import { mockLayer } from '../test-utils';

describe('layerFromJSON', () => {
  test('should return null when type is specified in a wrong way', () => {
    const jsonLayer: ILayerJSON = {
        "width": 5,
        "height": 5,
        "depth": 2,
        "weights":  null,
        "type": "WrongType",
        "praxisOpts": null,
    };

    expect(layerFromJSON(jsonLayer)).toBe(null);
  });

  test('should not return null for a properly specified type', () => {
    const jsonLayer: ILayerJSON = {
      "width": 5,
      "height": 5,
      "depth": 2,
      "weights":  null,
      "type": "EntryPoint",
      "praxisOpts": null,
    };

    expect(layerFromJSON(jsonLayer)).not.toBe(null);
  });

  test('should output a layer', () => {
    const jsonLayer: ILayerJSON = {
      "width": 3,
      "height": 2,
      "weights":  null,
      "type": "EntryPoint",
    };

    const mockedLayer = mockLayer({
      width: 3,
      height: 2,
      weights: null,
      deltas: null,
    });

    expect(layerFromJSON(jsonLayer)).toEqual(mockedLayer);
  });
});
