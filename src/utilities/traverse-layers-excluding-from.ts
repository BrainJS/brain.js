import { ILayer } from '../layer/base-layer';

export default function traverseLayersExcludingFrom(
  layer: ILayer,
  inputLayer: ILayer,
  recurrentLayer: ILayer,
  cb: (layer: ILayer) => void
): void {
  if (layer === inputLayer || layer === recurrentLayer) return;
  if (layer.hasOwnProperty('inputLayer')) {
    traverseLayersExcludingFrom(
      (layer as ILayer & { inputLayer: ILayer }).inputLayer,
      inputLayer,
      recurrentLayer,
      cb
    );
  } else {
    if (layer.hasOwnProperty('inputLayer1')) {
      traverseLayersExcludingFrom(
        (layer as ILayer & { inputLayer1: ILayer }).inputLayer1,
        inputLayer,
        recurrentLayer,
        cb
      );
    }
    if (layer.hasOwnProperty('inputLayer2')) {
      traverseLayersExcludingFrom(
        (layer as ILayer & { inputLayer2: ILayer }).inputLayer2,
        inputLayer,
        recurrentLayer,
        cb
      );
    }
  }
  cb(layer);
}
