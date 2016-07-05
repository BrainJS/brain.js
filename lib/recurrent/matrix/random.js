var Matrix = require('./index');

/** return Mat but filled with random numbers from gaussian
 * @param n
 * @param d
 * @param mu
 * @param std
 * @constructor
 */
function RandomMatrix(n,d,mu,std) {
  this.weights = zeros(n * d);
  this.dw = zeros(n * d);
  this.fillRand(-std, std); // kind of :P
}
RandomMatrix.prototype = Matrix.prototype;

module.exports = RandomMatrix;