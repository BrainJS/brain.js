'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = layerFromJSON;
var layer = require('../layer');

function layerFromJSON(jsonLayer) {
  if (!layer.hasOwnProperty(jsonLayer.type)) return null;
  var Layer = layer[jsonLayer.type];
  var realLayer = Reflect.construct(Layer, arguments);
  for (var p in jsonLayer) {
    if (!jsonLayer.hasOwnProperty(p)) continue;
    if (p === 'type') continue;
    realLayer[p] = jsonLayer[p];
  }
  return realLayer;
}
//# sourceMappingURL=layer-from-json.js.map