var Matrix = require('./');

/**
 * creates new Matrix
 * adds left and right weights to newly created Matrix weights
 * pushes lambda to rnn.backprop which adds new Matrix recurrence to left and right Matrices
 * returns the newly created matrix
 * @param {Matrix} left
 * @param {Matrix} right
 * @param {RNN|*} rnn
 * @returns {Matrix}
 */
module.exports = function addB(left, right, rnn) {
  if (left.weights.length !== right.weights.length) throw new Error('misaligned matrices');

  var result = new Matrix(left.rows, left.columns);
  for(var i = 0, n = left.weights.length; i < n; i++) {
    result.weights[i] = left.weights[i] + right.weights[i];
  }

  rnn.backprop.push(function() {
    for(var i = 0, n = left.weights.length; i < n; i++) {
      left.recurrence[i] += result.recurrence[i];
      right.recurrence[i] += result.recurrence[i];
    }
  });

  return result;
};
