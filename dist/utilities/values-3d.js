'use strict';

var values2D = require('./values-2d');

module.exports = function values3D(width, height, depth, value) {
  var result = new Array(depth);
  for (var z = 0; z < depth; z++) {
    result[z] = values2D(width, height, value);
  }
  return result;
};