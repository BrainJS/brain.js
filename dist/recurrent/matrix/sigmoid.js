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
  for (var i = 0, max = left.weights.length; i < max; i++) {
    product.weights[i] = 1 / (1 + Math.exp(-left.weights[i]));

    //TODO: needed?
    product.recurrence[i] = 0;
    left.recurrence[i] = 0;
  }
}

function sig(x) {
  // helper function for computing sigmoid
  return 1 / (1 + Math.exp(-x));
}
//# sourceMappingURL=sigmoid.js.map