"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cloneNegative;
/**
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
function cloneNegative(product, left) {
  product.rows = parseInt(left.rows);
  product.columns = parseInt(left.columns);
  product.weights = left.weights.slice(0);
  product.deltas = left.deltas.slice(0);
  for (var i = 0; i < left.weights.length; i++) {
    product.weights[i] = -left.weights[i];
    product.deltas[i] = 0;
  }
}
//# sourceMappingURL=clone-negative.js.map