/**
 * adds {from} recurrence to {left} and {right} recurrence
 * @param {Matrix} from
 * @param {Matrix} left
 * @param {Matrix} right
 */
module.exports = function addB(from, left, right) {
  for(var i = 0, n = left.weights.length; i < n; i++) {
    left.recurrence[i] += from.recurrence[i];
    right.recurrence[i] += from.recurrence[i];
  }
};
