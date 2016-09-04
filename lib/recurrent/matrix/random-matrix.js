var Matrix = require('./');
var randomF = require('../random').f;

/** return Matrix but filled with random numbers from gaussian
 * @param {Number} [rows]
 * @param {Number} [columns]
 * @param std
 * @constructor
 * @extends {Matrix}
 */
function RandomMatrix(rows, columns, std) {
  Matrix.call(this, rows, columns);
  if (std) this.fillRand(-std, std);
}

RandomMatrix.prototype = Object.assign({
  // fill matrix with random gaussian numbers
  fillRand: function(lo, hi) {
    for(var i = 0, n = this.weights.length; i < n; i++) {
      this.weights[i] = randomF(lo, hi);
    }
  }
}, Matrix.prototype);

module.exports = RandomMatrix;
