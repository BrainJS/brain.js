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
  for (var i = 0, max = left.weights.length; i < max; i++) {
    product.weights[i] = Math.tanh(left.weights[i]);
  }
}
//# sourceMappingURL=tanh.js.map