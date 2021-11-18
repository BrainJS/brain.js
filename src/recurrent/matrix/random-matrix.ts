import { Matrix } from '.';
import { randomFloat } from '../../utilities/random';

/** return Matrix but filled with random numbers from gaussian
 */
export class RandomMatrix extends Matrix {
  std: number;

  constructor(rows: number, columns: number, std: number) {
    super(rows, columns);

    this.std = std;

    for (let i = 0, max = this.weights.length; i < max; i++) {
      this.weights[i] = randomFloat(-std, std);
    }
  }
}
