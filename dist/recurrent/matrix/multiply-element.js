"use strict";

/**
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
module.exports = function multiplyElement(product, left, right) {
  var weights = left.weights;

  for (var i = 0; i < weights.length; i++) {
    product.weights[i] = left.weights[i] * right.weights[i];
    product.deltas[i] = 0;
  }
};