var Matrix = require('./');

/**
 *
 * @param {Matrix} m
 */
export default function clone(m) {
  var cloned = new Matrix();
  cloned.rows = parseInt(m.rows);
  cloned.columns = parseInt(m.columns);
  cloned.weights = m.weights.slice(0);
  cloned.recurrence = m.recurrence.slice(0);
  return cloned;
}
