var Matrix = require('./index');
var randomN = require('../random').n;
/**
 *
 * @param {Number} rows
 * @param {Number} columns
 * @param mu
 * @param std
 * @constructor
 */
function RandomNMatrix(rows, columns, mu, std) {
  Matrix.call(this, rows, columns);
  this.fillRandN(mu, std);
}
RandomNMatrix.prototype = Object.create(Matrix.prototype, {
  // fill matrix with random gaussian numbers
  fillRandN: function(mu, std) {
    for(var i = 0, n = this.weights.length; i < n; i++) {
      this.weights[i] = randomN(mu, std);
    }
  }
});

module.exports = RandomNMatrix;