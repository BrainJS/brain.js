import { Matrix } from '.';

export function copy(product: Matrix, left: Matrix): void {
  product.rows = left.rows;
  product.columns = left.columns;
  product.weights = left.weights.slice(0);
  product.deltas = left.deltas.slice(0);
}
