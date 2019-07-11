'use strict';

var randomWeight = require('./random-weight');

module.exports = function randos(size) {
  var array = new Float32Array(size);
  for (var i = 0; i < size; i++) {
    array[i] = randomWeight();
  }
  return array;
};