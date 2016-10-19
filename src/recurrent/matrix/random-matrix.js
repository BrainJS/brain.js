import Matrix from './';
import { randomF } from '../../utilities/random';

/** return Matrix but filled with random numbers from gaussian
 * @param {Number} [rows]
 * @param {Number} [columns]
 * @param std
 * @constructor
 */
export default class RandomMatrix extends Matrix {
  constructor(rows, columns, std) {
    super(rows, columns);
    this.rows = rows;
    this.columns = columns;
    this.std = std;
    for(let i = 0, max = this.weights.length; i < max; i++) {
      this.weights[i] = randomF(-std, std);
    }
  }
}
