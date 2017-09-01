"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = allOnes;
/**
 * makes matrix weights and deltas all ones
 * @param {Matrix} product
 */
function allOnes(product) {
  for (var i = 0; i < product.weights.length; i++) {
    product.weights[i] = 1;
    product.deltas[i] = 0;
  }
}
//# sourceMappingURL=all-ones.js.map