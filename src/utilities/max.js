const toArray = require('./to-array');
/**
 *
 * @param values
 * @returns {number}
 */
module.exports = function max(values) {
  return Math.max(...toArray(values));
}
