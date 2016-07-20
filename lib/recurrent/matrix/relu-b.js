var Matrix = require('./');

/**
 * creates new Matrix
 * relus weight of m to new Matrix weights
 * pushes lambda to rnn.backprop which adds new Matrix recurrence to m recurrence
 * returns the newly created matrix
 * @param {Matrix} m
 * @param {RNN|*} rnn
 * @returns {Matrix}
 */
module.exports = function reluB(m, rnn) {
  var result = new Matrix(m.rows, m.columns);
  var n = m.weights.length;
  for(var i=0;i<n;i++) {
    result.weights[i] = Math.max(0, m.weights[i]); // relu
  }

  rnn.backprop.push(function () {
    for(var i=0;i<n;i++) {
      m.recurrence[i] += m.weights[i] > 0 ? result.recurrence[i] : 0.0;
    }
  });

  return result;
};
