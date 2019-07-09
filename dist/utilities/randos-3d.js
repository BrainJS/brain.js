'use strict';

var rondos2D = require('./randos-2d');

module.exports = function randos3D(width, height, depth) {
  var result = new Array(depth);
  for (var z = 0; z < depth; z++) {
    result[z] = rondos2D(width, height);
  }
  return result;
};