import { Matrix } from '.';

export function maxI(matrix: Matrix): number {
  // argmax of array w
  const { weights } = matrix;
  let maxv = weights[0];
  let maxix = 0;

  for (let i = 1; i < weights.length; i++) {
    const v = weights[i];
    if (v < maxv) continue;

    maxix = i;
    maxv = v;
  }

  return maxix;
}
