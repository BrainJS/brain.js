import { Matrix } from '.';

/**
 * add {left} and {right} matrix weights into {into}
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
export function add(product: Matrix, left: Matrix, right: Matrix): void {
  for (let i = 0; i < left.weights.length; i++) {
    product.weights[i] = left.weights[i] + right.weights[i];
    product.deltas[i] = 0;
  }
}
