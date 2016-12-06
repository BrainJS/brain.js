"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = allOnes;
/**
 * makes matrix weights and recurrence all ones
 * @param {Matrix} product
 */
function allOnes(product) {
  for (var i = 0, max = product.weights.length; i < max; i++) {
    product.weights[i] = 1;
    product.recurrence[i] = 0;
  }
}
//# sourceMappingURL=all-ones.js.map