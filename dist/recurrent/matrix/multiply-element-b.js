"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = multiplyElementB;
/**
 * multiplies {left} and {right} weight by {from} recurrence into {left} and {right} recurrence
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
function multiplyElementB(product, left, right) {
  for (var i = 0; i < left.weights.length; i++) {
    left.recurrence[i] = right.weights[i] * product.recurrence[i];
    right.recurrence[i] = left.weights[i] * product.recurrence[i];
  }
}
//# sourceMappingURL=multiply-element-b.js.map