/* eslint-disable prettier/prettier */
import { layerTypes } from '../layer';
import { ILayer, ILayerJSON } from '../layer/base-layer';

export default function layerFromJSON(
  jsonLayer: ILayerJSON,
  ...args: unknown[]
): ILayer {
  const Layer = layerTypes[jsonLayer.type];

  const realLayer = new Layer(...args);

  for (const [key, value] of Object.entries(jsonLayer))
    if (key !== 'type') realLayer[key] = value;

  return realLayer;
}
