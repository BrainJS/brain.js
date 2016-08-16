var Matrix = require('./');

/**
 * @param {Matrix} into
 * @param {Matrix} m
 * @param {Number} row
 */
module.exports = function rowPluck(into, m, row) {
  for (var column = 0, columns = m.columns; column < columns; column++) {
    into.weights[column] = m.weights[columns * row + column];
  }
};
