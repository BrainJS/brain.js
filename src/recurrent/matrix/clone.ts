import { Matrix } from '.';

/**
 *
 * @param {Matrix} product
 */
module.exports = function clone(product: Matrix) {
  const cloned = new Matrix();

  cloned.rows = product.rows;
  cloned.columns = product.columns;
  cloned.weights = product.weights.slice(0);
  cloned.deltas = product.deltas.slice(0);

  return cloned;
};
