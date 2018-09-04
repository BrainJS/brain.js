'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = traverseLayersFrom;
function traverseLayersFrom(layer, cb) {
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
}