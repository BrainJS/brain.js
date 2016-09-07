var ones = require('../../utilities/ones');

/** return Matrix but filled with random numbers from gaussian
 * @param {Number} [rows]
 * @param {Number} [columns]
 * @constructor
 */
export default class OnesMatrix {
  constructor(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.weights = ones(rows * columns);
    this.recurrence = ones(rows * columns);
  }

  fill() {
    this.weights = ones(this.rows * this.columns);
    this.recurrence = ones(this.rows * this.columns);
  }
}
