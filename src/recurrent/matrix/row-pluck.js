/**
 * @param {Matrix} into
 * @param {Matrix} m
 * @param {Number} rowIndex
 */
export default function rowPluck(into, m, rowIndex) {
  for (let column = 0, columns = m.columns; column < columns; column++) {
    into.weights[column] = m.weights[columns * rowIndex + column];
    into.recurrence[column] = 0;
  }
}
