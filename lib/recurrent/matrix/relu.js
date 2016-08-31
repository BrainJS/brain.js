var Matrix = require('./');

/**
 *
 * relu {m} weights to {into} weights
 * @param {Matrix} into
 * @param {Matrix} m
 */
module.exports = function relu(into, m) {
  for(var i = 0, n = m.weights.length; i < n ; i++) {
    into.weights[i] = Math.max(0, m.weights[i]); // relu
    into.recurrence[i] = 0;
  }
};
