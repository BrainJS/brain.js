'use strict';

var layer = require('../layer');

module.exports = function layerFromJSON(jsonLayer) {
  if (!layer.hasOwnProperty(jsonLayer.type)) return null;
  var Layer = layer[jsonLayer.type];

  // eslint-disable-next-line
  var realLayer = Reflect.construct(Layer, arguments);

  Object.keys(jsonLayer).forEach(function (p) {
    if (p !== 'type') {
      realLayer[p] = jsonLayer[p];
    }
  });

  return realLayer;
};