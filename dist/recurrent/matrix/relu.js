"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = relu;
/**
 *
 * relu {m} weights to {into} weights
 * @param {Matrix} product
 * @param {Matrix} left
 */
function relu(product, left) {
  for (var i = 0, max = left.weights.length; i < max; i++) {
    product.weights[i] = Math.max(0, left.weights[i]); // relu

    //TODO: needed?
    product.recurrence[i] = 0;
    left.recurrence[i] = 0;
  }
}
//# sourceMappingURL=relu.js.map