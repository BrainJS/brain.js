"use strict";

/**
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
module.exports = function sigmoidB(product, left) {
  for (var i = 0; i < product.deltas.length; i++) {
    var mwi = product.weights[i];
    left.deltas[i] = mwi * (1 - mwi) * product.deltas[i];
  }
};