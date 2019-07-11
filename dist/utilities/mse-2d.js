"use strict";

module.exports = function mse2d(errors) {
  // mean squared error 2d
  var sum = 0;
  var length = errors.length * errors[0].length;
  for (var y = 0; y < errors.length; y++) {
    for (var x = 0; x < errors[y].length; x++) {
      sum += Math.pow(errors[y][x], 2);
    }
  }
  return sum / length;
};