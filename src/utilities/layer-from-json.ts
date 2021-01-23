import * as layer from '../layer';
import { layerTypes, ILayerJSON, ILayer, Target } from '../layer';
import { ActivationType } from '../layer/activation';
import { FilterType } from '../layer/filter';
import { InternalType } from '../layer/internal';
import { ModifierType } from '../layer/modifier';
import { OperatorType } from '../layer/operator';
import { BaseLayerType } from '../layer/base-layer';
import { TargetType } from '../layer/target';

export function layerFromJSON(
  jsonLayer: ILayerJSON,
  inputLayer1?: ILayer,
  inputLayer2?: ILayer
): ILayer | null {
  if (!layer.hasOwnProperty(jsonLayer.type)) {
    return null;
  }
  const Layer = ((layer as unknown) as {
    [layerType: string]:
      | TargetType
      | ActivationType
      | FilterType
      | InternalType
      | ModifierType
      | OperatorType;
  })[jsonLayer.type];
  if (Layer.prototype instanceof layerTypes.Filter) {
    if (!inputLayer1) throw new Error('inputLayer missing');
    return new (Layer as FilterType)(jsonLayer, inputLayer1);
  } else if (
    Layer.prototype instanceof layerTypes.Activation ||
    Layer.prototype instanceof layerTypes.Modifier
  ) {
    if (!inputLayer1) throw new Error('inputLayer missing');
    return new (Layer as ActivationType)(inputLayer1, jsonLayer);
  } else if (Layer.prototype instanceof layerTypes.Internal) {
    return new (Layer as InternalType)(jsonLayer);
  } else if (Layer.prototype instanceof layerTypes.Operator) {
    if (!inputLayer1) throw new Error('inputLayer1 missing');
    if (!inputLayer2) throw new Error('inputLayer2 missing');
    return new (Layer as OperatorType)(inputLayer1, inputLayer2, jsonLayer);
  } else if (
    Layer.prototype instanceof layerTypes.InternalModel ||
    Layer.prototype instanceof layerTypes.EntryPoint ||
    Layer.prototype instanceof layerTypes.Model
  ) {
    return new (Layer as BaseLayerType)(jsonLayer);
  } else if (Layer === Target) {
    if (!inputLayer1) throw new Error('inputLayer missing');
    return new (Layer as TargetType)(jsonLayer, inputLayer1);
  }
  return null;
}
