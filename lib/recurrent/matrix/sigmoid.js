var Matrix = require('./');

/**
 *
 * @param {Matrix} m
 */
module.exports = function sigmoid(m) {
  // sigmoid nonlinearity
  var result = new Matrix(m.rows, m.columns);
  for(var i=0, max = m.weights.length; i < max; i++) {
    result.weights[i] = 1.0 / ( 1 + Math.exp(-m.weights[i]));
  }
  return result;
};


function sig(x) {
  // helper function for computing sigmoid
  return 1.0 / (1 + Math.exp(-x));
}