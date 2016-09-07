import Matrix from './';

/**
 *
 * @param {Matrix} m
 */
export default function clone(m) {
  let cloned = new Matrix();
  cloned.rows = parseInt(m.rows);
  cloned.columns = parseInt(m.columns);
  cloned.weights = m.weights.slice(0);
  cloned.recurrence = m.recurrence.slice(0);
  return cloned;
}
