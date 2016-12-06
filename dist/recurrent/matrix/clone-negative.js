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
  product.recurrence = left.recurrence.slice(0);
  for (var i = 0, max = left.weights.length; i < max; i++) {
    product.weights[i] = -left.weights[i];
    product.recurrence[i] = 0;
  }
}
//# sourceMappingURL=clone-negative.js.map