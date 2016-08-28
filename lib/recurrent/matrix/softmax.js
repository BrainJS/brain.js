var Matrix = require('./');
/**
 *
 * @param {Matrix} m
 * @returns {Matrix}
 */
module.exports = function softmax(m) {
  var result = new Matrix(m.rows, m.columns); // probability volume
  var maxVal = -999999;
  var i;
  var max;

  for (i = 0, max = m.weights.length; i < max; i++) {
    if(m.weights[i] <= maxVal) continue;
    maxVal = m.weights[i];
  }

  var s = 0;
  for (i = 0, max = m.weights.length; i < max; i++) {
    result.weights[i] = Math.exp(m.weights[i] - maxVal);
    s += result.weights[i];
  }

  for (i = 0, max = m.weights.length; i < max; i++) {
    result.weights[i] /= s;
  }

  // no backward pass here needed
  // since we will use the computed probabilities outside
  // to set gradients directly on m
  return result;
};
