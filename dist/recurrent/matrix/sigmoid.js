"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sigmoid;
/**
 * @param {Matrix} product
 * @param {Matrix} left
 */
function sigmoid(product, left) {
  // sigmoid nonlinearity
  for (var i = 0; i < left.weights.length; i++) {
    product.weights[i] = 1 / (1 + Math.exp(-left.weights[i]));
    product.deltas[i] = 0;
  }
}

function sig(x) {
  // helper function for computing sigmoid
  return 1 / (1 + Math.exp(-x));
}
//# sourceMappingURL=sigmoid.js.map