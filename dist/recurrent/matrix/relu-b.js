"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = reluB;
/**
 * adds {from} recurrence to {m} recurrence when {m} weights are above other a threshold of 0
 * @param {Matrix} product
 * @param {Matrix} m
 */
function reluB(product, left) {
  for (var i = 0, max = product.recurrence.length; i < max; i++) {
    left.recurrence[i] += left.weights[i] > 0 ? product.recurrence[i] : 0;
  }
}
//# sourceMappingURL=relu-b.js.map