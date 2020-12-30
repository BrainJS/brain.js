import { flattenLayers } from '../../src/utilities/flatten-layers';
import { mockLayer } from '../test-utils';

describe('flattenLayers', () => {
  it('shallow clones the original array of layers', () => {
    const layers = [mockLayer({ width: 1, height: 1 })];
    expect(flattenLayers(layers)).not.toBe(layers);
  });
  it('flattens nested layers from inputLayer property', () => {
    const layer1 = mockLayer({ width: 1, height: 1, name: 'layer1' });
    const layer2 = mockLayer({ width: 1, height: 1, name: 'layer2' });
    const layer3 = mockLayer({ width: 1, height: 1, name: 'layer3' });
    const layer4 = mockLayer({ width: 1, height: 1, name: 'layer4' });
    layer4.inputLayer = layer3;
    layer3.inputLayer = layer2;
    layer2.inputLayer = layer1;

    expect(flattenLayers([layer4])).toEqual([
      layer1,
      layer2,
      layer3,
      layer4,
    ]);
  });
  it('flattens nested layers from inputLayer1 and inputLayer2 properties', () => {
    const layer1 = mockLayer({ width: 1, height: 1, name: 'layer1' });
    const layer2 = mockLayer({ width: 1, height: 1, name: 'layer2' });
    const layer3 = mockLayer({ width: 1, height: 1, name: 'layer3' });
    const layer4 = mockLayer({ width: 1, height: 1, name: 'layer4' });
    layer4.inputLayer1 = layer2;
    layer4.inputLayer2 = layer3;
    layer2.inputLayer = layer1;

    expect(flattenLayers([layer4])).toEqual([
      layer1,
      layer2,
      layer3,
      layer4,
    ]);
  });
});
