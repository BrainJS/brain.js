import Matrix from './';
import { randomN } from '../../utilities/random';
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
    for(let i = 0, max = this.weights.length; i < max; i++) {
      this.weights[i] = randomN(mu, std);
    }
  }
}
