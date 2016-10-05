"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sigmoidB;
/**
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
function sigmoidB(product, left) {
  for (var i = 0, max = left.weights.length; i < max; i++) {
    var mwi = product.weights[i];
    left.recurrence[i] += mwi * (1 - mwi) * product.recurrence[i];
  }
}
//# sourceMappingURL=sigmoid-b.js.map