"use strict";

/**
 *
 * relu {m} weights to {into} weights
 * @param {Matrix} product
 * @param {Matrix} left
 */
module.exports = function relu(product, left) {
  for (var i = 0; i < left.weights.length; i++) {
    product.weights[i] = Math.max(0, left.weights[i]); // relu
    product.deltas[i] = 0;
  }
};