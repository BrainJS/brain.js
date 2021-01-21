import { Matrix } from '.';
import { ones } from '../../utilities/ones';

/** return Matrix of ones
 */
export class OnesMatrix extends Matrix {
  constructor(rows: number, columns: number) {
    super(rows, columns);

    this.rows = rows;
    this.columns = columns;
    this.weights = ones(rows * columns);
    this.deltas = ones(rows * columns);
  }
}
