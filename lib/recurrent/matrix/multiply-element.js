var Matrix = require('./index');

/**
 * @param {Matrix} into
 * @param {Matrix} left
 * @param {Matrix} right
 */
module.exports = function multiplyElement(into, left, right) {
  for(var i = 0, weights = left.weights.length; i < weights; i++) {
    into.weights[i] = left.weights[i] * right.weights[i];
    into.recurrence[i] = 0;
  }
};
