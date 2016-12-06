/**
 * adds {from} recurrence into {m} recurrence
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Number} rowIndex
 */
export default function rowPluckB(product, left, rowIndex) {
  for (let column = 0, columns = left.columns; column < columns; column++) {
    left.recurrence[columns * rowIndex + column] += product.recurrence[column];
  }
}
