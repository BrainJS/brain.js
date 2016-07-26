var Matrix = require('./');
/**
 *
 * @param {Matrix} m
 * @returns {Matrix}
 */
module.exports = function softmax(m) {
  var result = new Matrix(m.rows, m.columns); // probability volume
  var maxval = -999999;
  var i;
  var n;

  for(i = 0 , n = m.weights.length; i < n; i++) {
    if(m.weights[i] > maxval) {
      maxval = m.weights[i];
    }
  }

  var s = 0.0;
  for(i = 0, n = m.weights.length; i < n; i++) {
    result.weights[i] = Math.exp(m.weights[i] - maxval);
    s += result.weights[i];
  }
  for(i = 0, n = m.weights.length; i < n; i++) {
    result.weights[i] /= s;
  }

  // no backward pass here needed
  // since we will use the computed probabilities outside
  // to set gradients directly on m
  return result;
};
