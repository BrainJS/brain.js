"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = addB;
/**
 * adds {from} deltas to {left} and {right} deltas
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
function addB(product, left, right) {
  for (var i = 0; i < product.deltas.length; i++) {
    left.deltas[i] = product.deltas[i];
    right.deltas[i] = product.deltas[i];
  }
}
//# sourceMappingURL=add-b.js.map