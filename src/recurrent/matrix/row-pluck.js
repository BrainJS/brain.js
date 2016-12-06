/**
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Number} rowPluckIndex
 */
export default function rowPluck(product, left, rowPluckIndex) {
  for (let column = 0, columns = left.columns; column < columns; column++) {
    product.weights[column] = left.weights[columns * rowPluckIndex + column];
  }
}
