"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = multiplyElement;
/**
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
function multiplyElement(product, left, right) {
  for (var i = 0, weights = left.weights.length; i < weights; i++) {
    product.weights[i] = left.weights[i] * right.weights[i];
    product.recurrence[i] = 0;
    left.recurrence[i] = 0;
    right.recurrence[i] = 0;
  }
}
//# sourceMappingURL=multiply-element.js.map