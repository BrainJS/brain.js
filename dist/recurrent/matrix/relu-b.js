"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = reluB;
/**
 * adds {from} deltas to {m} deltas when {m} weights are above other a threshold of 0
 * @param {Matrix} product
 * @param {Matrix} m
 */
function reluB(product, left) {
  for (var i = 0; i < product.deltas.length; i++) {
    left.deltas[i] = left.weights[i] > 0 ? product.deltas[i] : 0;
  }
}
//# sourceMappingURL=relu-b.js.map