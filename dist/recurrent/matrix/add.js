"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = add;
/**
 * add {left} and {right} matrix weights into {into}
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
function add(product, left, right) {
  for (var i = 0; i < left.weights.length; i++) {
    product.weights[i] = left.weights[i] + right.weights[i];
    product.deltas[i] = 0;
  }
}
//# sourceMappingURL=add.js.map