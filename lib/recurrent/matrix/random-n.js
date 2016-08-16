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
function RandomMatrixN(rows, columns, mu, std) {
  Matrix.call(this, rows, columns);
  this.fillRandN(mu, std);
}
RandomMatrixN.prototype = Object.create(Matrix.prototype, {
  // fill matrix with random gaussian numbers
  fillRandN: function(mu, std) {
    for(var i = 0, n = this.weights.length; i < n; i++) {
      this.weights[i] = randomN(mu, std);
    }
  }
});

module.exports = RandomMatrixN;