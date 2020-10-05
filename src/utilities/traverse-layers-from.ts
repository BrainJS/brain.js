import { ILayer } from '../layer/base-layer';

export default function traverseLayersFrom(
  layer: ILayer,
  cb: (layer: ILayer) => void
): void {
  if (layer.hasOwnProperty('inputLayer')) {
    traverseLayersFrom(
      (layer as ILayer & { inputLayer: ILayer }).inputLayer,
      cb
    );
  } else {
    if (layer.hasOwnProperty('inputLayer1')) {
      traverseLayersFrom(
        (layer as ILayer & { inputLayer1: ILayer }).inputLayer1,
        cb
      );
    }
    if (layer.hasOwnProperty('inputLayer2')) {
      traverseLayersFrom(
        (layer as ILayer & { inputLayer2: ILayer }).inputLayer2,
        cb
      );
    }
  }
  cb(layer);
}
