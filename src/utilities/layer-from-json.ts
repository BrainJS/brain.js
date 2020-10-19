import * as layer from '../layer';
import { ILayer, ILayerJSON } from '../layer/base-layer';

const getStringKeyValue = (
  object: any,
  path: string | string[],
  defaultValue: any
) => {
  const pathArray = Array.isArray(path)
    ? path
    : path.split('.').filter((key) => key);
  const pathArrayFlat = pathArray.flatMap((part) =>
    typeof part === 'string' ? part.split('.') : part
  );

  return pathArrayFlat.reduce((obj, key) => obj?.[key], object) || defaultValue;
};

export default function layerFromJSON(
  jsonLayer: ILayerJSON,
  inputLayer1?: ILayer
) {
  if (!layer.hasOwnProperty(jsonLayer.type)) return null;

  // eslint-disable-next-line @typescript-eslint/ban-types
  const Layer: Function = getStringKeyValue(
    layer,
    // BUG: layer is object here, which will stringify as [object object]
    // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-plus-operands
    layer + '.' + jsonLayer.type,
    inputLayer1
  );

  // eslint-disable-next-line
  const realLayer: ILayer | any = Reflect.construct(Layer, arguments);

  Object.keys(jsonLayer).forEach((param: string) => {
    if (param !== 'type') {
      realLayer[param] = getStringKeyValue(
        jsonLayer,
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions,  @typescript-eslint/no-base-to-string
        `${jsonLayer}.${param}`,
        inputLayer1
      );
    }
  });

  return realLayer;
}
