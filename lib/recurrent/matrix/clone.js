var Matrix = require('./');
var RandomMatrix = require('./random-matrix');
var RandomNMatrix = require('./random-n-matrix');

/**
 *
 * @param {Matrix} m
 */
function clone(m) {
  var cloned = new Matrix();
  cloned.rows = parseInt(m.rows);
  cloned.columns = parseInt(m.columns);
  cloned.weights = m.weights.slice(0);
  cloned.recurrence = m.recurrence.slice(0);
  return cloned;
}

module.exports = clone;