var Matrix = require('./');
var zeros = require('./zeros');

/** return Matrix but filled with random numbers from gaussian
 * @param {Number} rows
 * @param {Number} columns
 * @param mu
 * @param std
 * @constructor
 */
function RandomMatrix(rows, columns, mu, std) {
  Matrix.call(this, rows, columns);
  this.fillRand(-std, std);
}

RandomMatrix.prototype = Object.create(Matrix.prototype);

module.exports = RandomMatrix;
