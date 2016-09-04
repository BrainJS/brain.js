/**
 * add {left} and {right} matrix weights into {into}
 * @param {Matrix} into
 * @param {Matrix} left
 * @param {Matrix} right
 */
module.exports = function add(into, left, right) {
  for(var i = 0, n = left.weights.length; i < n; i++) {
    into.weights[i] = left.weights[i] + right.weights[i];
    into.recurrence[i] = 0;
  }
};
