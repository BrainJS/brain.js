var Matrix = require('./index');

/**
 *
 * @param {Number} rows
 * @param {Number} columns
 * @param mu
 * @param std
 * @constructor
 */
function RandomMatrixN(rows, columns, mu, std) {
  Matrix.call(this, rows, columns);
  this.fillRandN(mu, std);
}
RandomMatrixN.prototype = Object.create(Matrix.prototype);

module.exports = RandomMatrixN;