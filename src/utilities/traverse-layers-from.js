export default function traverseLayersFrom(layer, cb) {
  if (layer.hasOwnProperty('inputLayer')) {
    traverseLayersFrom(layer.inputLayer, cb);
  } else if (layer.hasOwnProperty('inputLayers')) {
    for (let i = 0; i < layer.inputLayers.length; i++) {
      traverseLayersFrom(layer.inputLayers[i], cb);
    }
  }
  cb(layer);
};