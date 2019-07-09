'use strict';

var randos = require('./randos');

module.exports = function randos2D(width, height) {
  var result = new Array(height);
  for (var y = 0; y < height; y++) {
    result[y] = randos(width);
  }
  return result;
};