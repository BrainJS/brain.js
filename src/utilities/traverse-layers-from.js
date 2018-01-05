export default function traverseLayersFrom(layer, cb) {
  if (layer.hasOwnProperty('inputLayer') && layer.inputLayer !== undefined) {
    traverseLayersFrom(layer.inputLayer, cb);
  } else if (layer.hasOwnProperty('inputLayers') && layer.inputLayers !== undefined) {
    for (let i = 0; i < layer.inputLayers.length; i++) {
      traverseLayersFrom(layer.inputLayers[i], cb);
    }
  }
  cb(layer);
};