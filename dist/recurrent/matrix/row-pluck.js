"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rowPluck;
/**
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Number} rowPluckIndex
 */
function rowPluck(product, left, rowPluckIndex) {
  var columns = left.columns;
  var rowBase = columns * rowPluckIndex;
  for (var column = 0; column < columns; column++) {
    product.weights[column] = left.weights[rowBase + column];
    product.deltas[column] = 0;
  }
}
//# sourceMappingURL=row-pluck.js.map