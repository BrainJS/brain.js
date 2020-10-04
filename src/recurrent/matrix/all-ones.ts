import { Matrix } from '.';

/**
 * makes matrix weights and deltas all ones
 * @param {Matrix} product
 */
export function allOnes(product: Matrix): void {
  for (let i = 0; i < product.weights.length; i++) {
    product.weights[i] = 1;
    product.deltas[i] = 0;
  }
}
