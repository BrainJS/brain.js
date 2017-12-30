'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = traverseLayersFrom;
function traverseLayersFrom(layer, cb) {
  if (layer.hasOwnProperty('inputLayer')) {
    traverseLayersFrom(layer.inputLayer, cb);
  } else if (layer.hasOwnProperty('inputLayers')) {
    for (var i = 0; i < layer.inputLayers.length; i++) {
      traverseLayersFrom(layer.inputLayers[i], cb);
    }
  }
  cb(layer);
};
//# sourceMappingURL=traverse-layers-from.js.map