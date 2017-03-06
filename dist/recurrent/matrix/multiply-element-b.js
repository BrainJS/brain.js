"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = multiplyElementB;
/**
 * multiplies {left} and {right} weight by {from} deltas into {left} and {right} deltas
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
function multiplyElementB(product, left, right) {
  for (var i = 0; i < left.weights.length; i++) {
    left.deltas[i] = right.weights[i] * product.deltas[i];
    right.deltas[i] = left.weights[i] * product.deltas[i];
  }
}
//# sourceMappingURL=multiply-element-b.js.map