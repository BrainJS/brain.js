import { Matrix } from '.';

const { randomFloat } = require('../../utilities/random');

/**
 *
 * @param {Matrix} matrix
 * @returns {number}
 */
export function sampleI(matrix: Matrix): number {
  // sample argmax from w, assuming w are
  // probabilities that sum to one
  const r = randomFloat(0, 1);
  const w = matrix.weights;
  let x = 0;
  let i = 0;

  while (true) {
    x += w[i];

    if (x > r) {
      return i;
    }

    i++;
  }
}
