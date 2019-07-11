'use strict';

var zeros = require('./zeros');

module.exports = function zeros2D(width, height) {
  var result = new Array(height);
  for (var y = 0; y < height; y++) {
    result[y] = zeros(width);
  }
  return result;
};