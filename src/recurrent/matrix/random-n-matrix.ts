import { Matrix } from '.';
import { randomN } from '../../utilities/random';

/**
 *
 * @param {Number} rows
 * @param {Number} columns
 * @param mu
 * @param std
 * @constructor
 */
export class RandomNMatrix extends Matrix {
  std: number;
  mu: number;

  constructor(rows: number, columns: number, mu: number, std: number) {
    super(rows, columns);

    this.std = std;
    this.mu = mu;

    this.fillRandN();
  }

  // fill matrix with random gaussian numbers
  fillRandN(): void {
    for (let i = 0, max = this.weights.length; i < max; i++) {
      this.weights[i] = randomN(this.mu, this.std);
    }
  }
}
