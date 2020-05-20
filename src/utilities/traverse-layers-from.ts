export interface Layer {
  inputLayer: any
  inputLayer1: any
  inputLayer2: any
}

export default function traverseLayersFrom(layer: Layer, cb: { (layer: Layer): void }){
  if (layer.hasOwnProperty('inputLayer')) {
    traverseLayersFrom(layer.inputLayer, cb);
  } else {
    if (layer.hasOwnProperty('inputLayer1')) {
      traverseLayersFrom(layer.inputLayer1, cb);
    }
    if (layer.hasOwnProperty('inputLayer2')) {
      traverseLayersFrom(layer.inputLayer2, cb);
    }
  }
  cb(layer);
};
