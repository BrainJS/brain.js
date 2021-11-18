import { Matrix } from '.';

function clone(product: Matrix): Matrix {
  const cloned = new Matrix();

  cloned.rows = product.rows;
  cloned.columns = product.columns;
  cloned.weights = product.weights.slice(0);
  cloned.deltas = product.deltas.slice(0);

  return cloned;
}

export default clone;
