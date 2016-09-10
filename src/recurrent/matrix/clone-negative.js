/**
 *
 * @param {Matrix} into
 * @param {Matrix} m
 */
export default function cloneNegative(into, m) {
  into.rows = parseInt(m.rows);
  into.columns = parseInt(m.columns);
  into.weights = m.weights.slice(0);
  into.recurrence = m.recurrence.slice(0);
  for (let i = 0, max = m.weights.length; i < max; i++) {
    into.weights[i] = -m.weights[i];
    into.recurrence[i] = 0;
  }
}
