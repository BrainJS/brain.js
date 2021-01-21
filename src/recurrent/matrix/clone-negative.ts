import { Matrix } from '.';

export function cloneNegative(product: Matrix, left: Matrix): void {
  product.rows = left.rows;
  product.columns = left.columns;
  product.weights = left.weights.slice(0);
  product.deltas = left.deltas.slice(0);

  for (let i = 0; i < left.weights.length; i++) {
    product.weights[i] = -left.weights[i];
    product.deltas[i] = 0;
  }
}
