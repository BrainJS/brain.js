var Matrix = require('./');

/**
 *
* creates new Matrix
 * tanh weight of m to new Matrix weights
 * pushes lambda to rnn.backprop which adds new Matrix recurrence to m recurrence
 * returns the newly created matrix
 * @param {Matrix} m
 * @param {RNN|*} rnn
 */
module.exports = function tanhB(m, rnn) {
  // tanh nonlinearity
  var result = new Matrix(m.rows, m.columns);
  var n = m.weights.length;
  for(var i=0;i<n;i++) {
    result.weights[i] = Math.tanh(m.weights[i]);
  }

  rnn.backprop.push(function() {
    for(var i=0;i<n;i++) {
      // grad for z = tanh(x) is (1 - z^2)
      var mwi = result.weights[i];
      m.recurrence[i] += (1.0 - mwi * mwi) * result.recurrence[i];
    }
  });

  return result;
};
