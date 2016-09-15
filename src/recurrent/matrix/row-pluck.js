/**
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Number} rowIndex
 */
export default function rowPluck(product, left, rowIndex) {
  for (let column = 0, columns = left.columns; column < columns; column++) {
    product.weights[column] = left.weights[columns * rowIndex + column];
    product.recurrence[column] = 0;
  }
}
