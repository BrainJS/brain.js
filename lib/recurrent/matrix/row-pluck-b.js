var Matrix = require('./');

/**
 * creates new Matrix
 * puts weights m into new Matrix weights
 * pushes lambda to rnn.backprop which puts new Matrix recurrence into m recurrence
 * returns the newly created matrix
 * @param {Matrix} m
 * @param {Number} row
 * @param {RNN|*} rnn
 * @returns {Matrix}
 */
module.exports = function rowPluckB(m, row, rnn) {
  // pluck a row of m with index ix and return it as col vector
  if (row < 0 && row >= m.rows) throw new Error('row cannot pluck');

  var columns = m.columns;
  var result = new Matrix(columns, 1);

  // copy over the data
  for (var column = 0; column < columns; column++) {
    result.weights[column] = m.weights[columns * row + column];
  }

  rnn.backprop.push(function () {
    for (var column = 0; column < columns; column++) {
      m.recurrence[columns * row + column] += result.recurrence[column];
    }
  });

  return result;
};
