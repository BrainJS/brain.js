var Matrix = require('./');

/**
 *
 * @param {Matrix} m
 */
module.exports = function relu(m) {
  var result = new Matrix(m.rows, m.columns);
  var n = m.weights.length;
  for(var i=0;i<n;i++) {
    result.weights[i] = Math.max(0, m.weights[i]); // relu
  }

  return result;
};
