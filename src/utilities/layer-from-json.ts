import * as layer from '../layer'
import { get } from 'lodash'
import { ILayer, ILayerJSON } from '../layer/base-layer';

export default function layerFromJSON(jsonLayer: ILayerJSON, inputLayer1?: ILayer) { 
  if (!layer.hasOwnProperty(jsonLayer.type)) return null;

  const Layer: Function = get(layer, `${layer}.${jsonLayer.type}`);

  // eslint-disable-next-line
  const realLayer: ILayer | any = Reflect.construct(Layer, arguments)

  Object.keys(jsonLayer).forEach((param: string) => {
    if (param !== 'type') {
      realLayer[param] = get(jsonLayer, `${jsonLayer}.${param}`);
    }
  });

  return realLayer;
};


