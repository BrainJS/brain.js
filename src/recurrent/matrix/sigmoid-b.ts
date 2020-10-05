import { Matrix } from '.';

/**
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
export function sigmoidB(product: Matrix, left: Matrix): void {
  for (let i = 0; i < product.deltas.length; i++) {
    const mwi = product.weights[i];
    left.deltas[i] = mwi * (1 - mwi) * product.deltas[i];
  }
}
