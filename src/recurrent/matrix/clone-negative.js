import Matrix from './';

/**
 *
 * @param {Matrix} m
 */
export default function cloneNegative(m) {
  let cloned = new Matrix(m.rows, m.columns);
  cloned.rows = parseInt(m.rows);
  cloned.columns = parseInt(m.columns);

  for (let i = 0, max = m.weights.length; i < max; i++) {
    cloned.weights[i] = -m.weights[i];
    cloned.recurrence[i] = -m.recurrence[i];
  }
  return cloned;
}
