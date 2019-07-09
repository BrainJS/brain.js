"use strict";

/**
 * adds {from} deltas into {m} deltas
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Number} rowIndex
 */
module.exports = function rowPluckB(product, left, rowIndex) {
  var columns = left.columns;

  var rowBase = columns * rowIndex;
  for (var column = 0; column < columns; column++) {
    left.deltas[rowBase + column] = product.deltas[column];
  }
};