'use strict';

var ones = require('./ones');

module.exports = function ones2D(width, height) {
  var result = new Array(height);
  for (var y = 0; y < height; y++) {
    result[y] = ones(width);
  }
  return result;
};