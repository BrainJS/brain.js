"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rowPluckB;
/**
 * adds {from} deltas into {m} deltas
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Number} rowIndex
 */
function rowPluckB(product, left, rowIndex) {
  var columns = left.columns;
  var rowBase = columns * rowIndex;
  for (var column = 0; column < columns; column++) {
    left.deltas[rowBase + column] = product.deltas[column];
  }
}
//# sourceMappingURL=row-pluck-b.js.map