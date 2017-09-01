/**
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Number} rowPluckIndex
 */
export default function rowPluck(product, left, rowPluckIndex) {
  const columns = left.columns;
  const rowBase = columns * rowPluckIndex;
  for (let column = 0; column < columns; column++) {
    product.weights[column] = left.weights[rowBase + column];
    product.deltas[column] = 0;
  }
}
