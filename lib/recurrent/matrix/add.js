var Matrix = require('./');

/**
 * add matrices
 * @param {Matrix} left
 * @param {Matrix} right
 * @returns {Matrix}
 */
module.exports = function add(left, right) {
  if (left.weights.length !== right.weights.length) throw new Error('misaligned matrices');

  var result = new Matrix(left.rows, left.columns);
  for(var i = 0, n = left.weights.length; i < n; i++) {
    result.weights[i] = left.weights[i] + right.weights[i];
  }

  return result;
};
