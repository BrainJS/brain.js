/**
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Number} rowPluckIndex
 */
module.exports = function rowPluck(product, left, rowPluckIndex) {
  const { columns } = left;
  const rowBase = columns * rowPluckIndex;
  for (let column = 0; column < columns; column++) {
    product.weights[column] = left.weights[rowBase + column];
    product.deltas[column] = 0;
  }
};
