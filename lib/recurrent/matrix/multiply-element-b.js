var Matrix = require('./index');

/**
 * creates new Matrix
 * multiplies left and right weights to newly created Matrix weights
 * pushes lambda to rnn.backprop which multiplies new Matrix recurrence to left and right Matrices
 * returns the newly created matrix
 * @param {Matrix} left
 * @param {Matrix} right
 * @param {RNN|*} rnn
 */
module.exports = function multiplyElementB(left, right, rnn) {
  if (left.weights.length !== right.weights.length) throw new Error('misaligned matrices');

  var result = new Matrix(left.rows, left.columns);
  for(var i = 0, weights = left.weights.length; i < weights; i++) {
    result.weights[i] = left.weights[i] * right.weights[i];
  }

  rnn.backprop.push(function() {
    for(var i = 0, weights = left.weights.length; i < weights; i++) {
      left.recurrence[i] += right.weights[i] * result.recurrence[i];
      right.recurrence[i] += left.weights[i] * result.recurrence[i];
    }
  });

  return result;
};
