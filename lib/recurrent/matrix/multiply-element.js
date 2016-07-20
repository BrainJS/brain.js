var Matrix = require('./index');

/**
 *
 * @param {Matrix} left
 * @param {Matrix} right
 */
module.exports = function multiplyElement(left, right) {
  if (left.weights.length !== right.weights.length) throw new Error('misaligned matrices');

  var result = new Matrix(left.rows, left.columns);
  for(var i = 0, weights = left.weights.length; i < weights; i++) {
    result.weights[i] = left.weights[i] * right.weights[i];
  }

  return result;
};
