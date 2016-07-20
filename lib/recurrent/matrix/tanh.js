var Matrix = require('./');

/**
 *
 * @param {Matrix} m
 */
module.exports = function tanh(m) {
  // tanh nonlinearity
  var out = new Matrix(m.n, m.d);
  var n = m.weights.length;
  for(var i=0;i<n;i++) {
    out.weights[i] = Math.tanh(m.weights[i]);
  }

  return out;
};
