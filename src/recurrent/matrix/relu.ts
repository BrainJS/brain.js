import { Matrix } from '.';

/**
 *
 * relu {m} weights to {into} weights
 */
export function relu(product: Matrix, left: Matrix): void {
  for (let i = 0; i < left.weights.length; i++) {
    product.weights[i] = Math.max(0, left.weights[i]); // relu
    product.deltas[i] = 0;
  }
}
