'use strict';

var values = require('./values');

module.exports = function values2D(width, height, value) {
  var result = new Array(height);
  for (var y = 0; y < height; y++) {
    result[y] = values(width, value);
  }
  return result;
};