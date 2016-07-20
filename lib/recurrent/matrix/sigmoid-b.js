var Matrix = require('./');

/**
 * creates new Matrix
 * sigmoids weight of m to new Matrix weights
 * pushes lambda to rnn.backprop which adds new Matrix recurrence to m recurrence
 * returns the newly created matrix
 * @param {Matrix} m
 * @param {RNN|*} rnn
 * @returns {Matrix}
 */
module.exports = function sigmoidB(m, rnn) {
  // sigmoid nonlinearity
  var result = new Matrix(m.rows, m.columns);
  for(var i=0, max = m.weights.length; i < max; i++) {
    result.weights[i] = 1.0 / ( 1 + Math.exp(-m.weights[i]));
  }

  rnn.backprop.push(function() {
    for(var i=0, max = m.weights.length; i < max; i++) {
      var mwi = result.weights[i];
      m.recurrence[i] += mwi * (1.0 - mwi) * result.recurrence[i];
    }
  });

  return result;
};
