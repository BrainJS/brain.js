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
  var weights = left.weights;

  for (var i = 0; i < weights.length; i++) {
    product.weights[i] = left.weights[i] * right.weights[i];
    product.deltas[i] = 0;
  }
}
//# sourceMappingURL=multiply-element.js.map