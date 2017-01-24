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
  for (var i = 0; i < product.recurrence.length; i++) {
    // grad for z = tanh(x) is (1 - z^2)
    var mwi = product.weights[i];
    left.recurrence[i] = (1 - mwi * mwi) * product.recurrence[i];
  }
}
//# sourceMappingURL=tanh-b.js.map