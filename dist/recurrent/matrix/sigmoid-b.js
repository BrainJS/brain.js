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
  for (var i = 0; i < product.deltas.length; i++) {
    var mwi = product.weights[i];
    left.deltas[i] = mwi * (1 - mwi) * product.deltas[i];
  }
}
//# sourceMappingURL=sigmoid-b.js.map