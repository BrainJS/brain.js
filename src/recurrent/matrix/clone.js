import Matrix from './';

/**
 *
 * @param {Matrix} product
 */
export default function clone(product) {
  let cloned = new Matrix();
  cloned.rows = parseInt(product.rows);
  cloned.columns = parseInt(product.columns);
  cloned.weights = product.weights.slice(0);
  cloned.deltas = product.deltas.slice(0);
  return cloned;
}
