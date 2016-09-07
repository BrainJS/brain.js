/**
 *
 * @param {Matrix} into
 * @param {Matrix} m
 */
export default function copy(into, m) {
  into.rows = parseInt(m.rows);
  into.columns = parseInt(m.columns);
  into.weights = m.weights.slice(0);
  into.recurrence = m.recurrence.slice(0);
}
