"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = tanh;
/**
 * @param {Matrix} product
 * @param {Matrix} left
 */
function tanh(product, left) {
  // tanh nonlinearity
  for (var i = 0; i < left.weights.length; i++) {
    product.weights[i] = Math.tanh(left.weights[i]);
    product.deltas[i] = 0;
  }
}
//# sourceMappingURL=tanh.js.map