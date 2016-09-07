var Matrix = require('./');

/**
 *
 * @param {Matrix} m
 */
export default function cloneNegative(m) {
  var cloned = new Matrix(m.rows, m.columns);
  cloned.rows = parseInt(m.rows);
  cloned.columns = parseInt(m.columns);

  for (var i = 0, max = m.weights.length; i < max; i++) {
    cloned.weights[i] = -m.weights[i];
    cloned.recurrence[i] = -m.recurrence[i];
  }
  return cloned;
}
