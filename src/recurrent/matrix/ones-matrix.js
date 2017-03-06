import Matrix from './';
import ones from '../../utilities/ones';

/** return Matrix but filled with random numbers from gaussian
 * @param {Number} [rows]
 * @param {Number} [columns]
 * @constructor
 */
export default class OnesMatrix extends Matrix {
  constructor(rows, columns) {
    super(rows, columns);
    this.rows = rows;
    this.columns = columns;
    this.weights = ones(rows * columns);
    this.deltas = ones(rows * columns);
  }
}
