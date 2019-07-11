"use strict";

/**
 * @param {Matrix} product
 * @param {Matrix} left
 */
module.exports = function tanh(product, left) {
  // tanh nonlinearity
  for (var i = 0; i < left.weights.length; i++) {
    product.weights[i] = Math.tanh(left.weights[i]);
    product.deltas[i] = 0;
  }
};