"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = tanhB;
/**
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
function tanhB(product, left) {
  for (var i = 0; i < product.deltas.length; i++) {
    // grad for z = tanh(x) is (1 - z^2)
    var mwi = product.weights[i];
    left.deltas[i] = (1 - mwi * mwi) * product.deltas[i];
  }
}
//# sourceMappingURL=tanh-b.js.map