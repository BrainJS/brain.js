'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = traverseLayersExcludingFrom;
function traverseLayersExcludingFrom(layer, inputLayer, recurrentLayer, cb) {
  if (layer === inputLayer || layer === recurrentLayer) return;
  if (layer.hasOwnProperty('inputLayer')) {
    traverseLayersExcludingFrom(layer.inputLayer, inputLayer, recurrentLayer, cb);
  } else {
    if (layer.hasOwnProperty('inputLayer1')) {
      traverseLayersExcludingFrom(layer.inputLayer1, inputLayer, recurrentLayer, cb);
    }
    if (layer.hasOwnProperty('inputLayer2')) {
      traverseLayersExcludingFrom(layer.inputLayer2, inputLayer, recurrentLayer, cb);
    }
  }
  cb(layer);
};
//# sourceMappingURL=traverse-layers-excluding-from.js.map