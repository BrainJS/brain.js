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
export default class extends Matrix {
  constructor(rows, columns, mu, std) {
    super(rows, columns);
    this.fillRandN(mu, std);
  }
  // fill matrix with random gaussian numbers
  fillRandN(mu, std) {
    for(var i = 0, n = this.weights.length; i < n; i++) {
      this.weights[i] = randomN(mu, std);
    }
  }
}
