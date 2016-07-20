var Matrix = require('./');

/**
 *
 * @param {Matrix} m
 * @param {Number} row
 */
module.exports = function rowPluck(m, row) {
  // pluck a row of m with index ix and return it as col vector
  if (row < 0 && row >= m.rows) throw new Error('row cannot pluck');

  var columns = m.columns;
  var result = new Matrix(columns, 1);

  // copy over the data
  for (var column = 0; column < columns; column++) {
    result.weights[column] = m.weights[columns * row + i];
  }

  return result;
};
