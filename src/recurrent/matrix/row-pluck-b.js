/**
 * adds {from} deltas into {m} deltas
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Number} rowIndex
 */
module.exports = function rowPluckB(product, left, rowIndex) {
  const { columns } = left;
  const rowBase = columns * rowIndex;
  for (let column = 0; column < columns; column++) {
    left.deltas[rowBase + column] = product.deltas[column];
  }
};
