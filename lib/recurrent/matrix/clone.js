var Matrix = require('./');
var RandomMatrix = require('./random');
/**
 *
 * @param {Matrix} m
 */
function clone(m) {
  var cloned;
  if (m instanceof Matrix) {
    cloned = new Matrix();
  } else if (m instanceof RandomMatrix) {
    cloned = new RandomMatrix();
  } else {
    throw new Error('unknown type');
  }

  cloned.rows = parseInt(m.rows);
  cloned.columns = parseInt(m.columns);
  cloned.weights = m.weights.slice(0);
  cloned.recurrence = m.recurrence.slice(0);
  return cloned;
}

module.exports = clone;