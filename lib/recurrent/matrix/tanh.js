var Matrix = require('./');

/**
 * @param {Matrix} into
 * @param {Matrix} m
 */
module.exports = function tanh(into, m) {
  // tanh nonlinearity
  for(var i = 0, n = m.weights.length; i < n; i++) {
    into.weights[i] = Math.tanh(m.weights[i]);
  }
};
