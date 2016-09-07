var Matrix = require('./');
var ones = require('../ones');

/** return Matrix but filled with random numbers from gaussian
 * @param {Number} [rows]
 * @param {Number} [columns]
 * @constructor
 * @extends {Matrix}
 */
function OnesMatrix(rows, columns) {
  Matrix.call(this);
  if (typeof rows === 'undefined') return;
  if (typeof columns === 'undefined') return;

  this.rows = rows;
  this.columns = columns;
  this.weights = ones(rows * columns);
  this.recurrence = ones(rows * columns);
}

OnesMatrix.prototype = Object.assign({
  fill: function() {
    this.weights = ones(this.rows * this.columns);
    this.recurrence = ones(this.rows * this.columns);
  }
}, Matrix.prototype);

module.exports = OnesMatrix;
