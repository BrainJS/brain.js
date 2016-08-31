var Matrix = require('./');

/**
 * @param {Matrix} into
 * @param {Matrix} m
 */
module.exports = function sigmoid(into, m) {
  // sigmoid nonlinearity
  for(var i=0, max = m.weights.length; i < max; i++) {
    into.weights[i] = 1 / ( 1 + Math.exp(-m.weights[i]));
    into.recurrence[i] = 0;
  }
};


function sig(x) {
  // helper function for computing sigmoid
  return 1 / (1 + Math.exp(-x));
}