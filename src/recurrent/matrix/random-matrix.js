import { randomF } from '../random';

/** return Matrix but filled with random numbers from gaussian
 * @param {Number} [rows]
 * @param {Number} [columns]
 * @param std
 * @constructor
 */
export default class RandomMatrix {
  constructor(rows, columns, std) {
    this.rows = rows;
    this.columns = columns;
    this.std = std;
    this.weights = [];
    this.recurrence = [];
    this.fill();
  }

  // fill matrix with random gaussian numbers
  fill() {
    if (!this.std) return;
    for(let i = 0, max = this.weights.length; i < max; i++) {
      this.weights[i] = randomF(-this.std, this.std);
      this.recurrence[i] = randomF(-this.std, this.std);
    }
  }
}
