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
  for (var i = 0, max = left.weights.length; i < max; i++) {
    product.weights[i] = left.weights[i] + right.weights[i];
  }
}
//# sourceMappingURL=add.js.map