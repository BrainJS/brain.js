import { Matrix } from '.';

/**
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
module.exports = function cloneNegative(product: Matrix, left: Matrix) {
  product.rows = left.rows;
  product.columns = left.columns;
  product.weights = left.weights.slice(0);
  product.deltas = left.deltas.slice(0);

  for (let i = 0; i < left.weights.length; i++) {
    product.weights[i] = -left.weights[i];
    product.deltas[i] = 0;
  }
};
