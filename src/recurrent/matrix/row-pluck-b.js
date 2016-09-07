/**
 * adds {from} recurrence into {m} recurrence
 * @param {Matrix} from
 * @param {Matrix} m
 * @param {Number} row
 */
export default function rowPluckB(from, m, row) {
  for (let column = 0, columns = m.columns; column < columns; column++) {
    m.recurrence[columns * row + column] += from.recurrence[column];
  }
}
