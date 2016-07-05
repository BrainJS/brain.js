var Matrix = require('./index');

/**
 *
 * @param n
 * @param d
 * @param mu
 * @param std
 * @constructor
 */
function RandomMatrixN(n,d,mu,std) {
  this.n = n;
  this.d = d;
  this.weights = zeros(n * d);
  this.dw = zeros(n * d);
  this.fillRandN(mu, std);
}
RandomMatrixN.prototype = Matrix.prototype;

module.exports = RandomMatrixN;