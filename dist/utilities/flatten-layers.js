'use strict';

var traverseLayersFrom = require('./traverse-layers-from');

module.exports = function flattenLayers(layers) {
  var result = layers.slice(0);

  var _loop = function _loop(i) {
    var offset = 0;
    traverseLayersFrom(result[i], function (layer) {
      if (result.indexOf(layer) === -1) {
        result.splice(i + offset, 0, layer);
        offset++;
      }
    });
  };

  for (var i = 0; i < result.length; i++) {
    _loop(i);
  }
  return result;
};