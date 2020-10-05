import { Matrix } from '.';

/**
 * multiplies {left} and {right} weight by {from} deltas into {left} and {right} deltas
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
export function multiplyElementB(
  product: Matrix,
  left: Matrix,
  right: Matrix
): void {
  for (let i = 0; i < left.weights.length; i++) {
    left.deltas[i] = right.weights[i] * product.deltas[i];
    right.deltas[i] = left.weights[i] * product.deltas[i];
  }
}
