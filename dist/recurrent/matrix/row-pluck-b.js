"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rowPluckB;
/**
 * adds {from} recurrence into {m} recurrence
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Number} rowIndex
 */
function rowPluckB(product, left, rowIndex) {
  for (var column = 0, columns = left.columns; column < columns; column++) {
    left.recurrence[columns * rowIndex + column] += product.recurrence[column];
  }
}
//# sourceMappingURL=row-pluck-b.js.map