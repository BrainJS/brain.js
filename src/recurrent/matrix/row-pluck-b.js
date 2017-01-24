/**
 * adds {from} recurrence into {m} recurrence
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Number} rowIndex
 */
export default function rowPluckB(product, left, rowIndex) {
  const columns = left.columns;
  const rowBase = columns * rowIndex;
  for (let column = 0; column < columns; column++) {
    left.recurrence[rowBase + column] = product.recurrence[column];
  }
}
