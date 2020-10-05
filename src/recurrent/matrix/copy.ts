import { Matrix } from '.';

/*
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
module.exports = function copy(product: Matrix, left: Matrix) {
  product.rows = left.rows;
  product.columns = left.columns;
  product.weights = left.weights.slice(0);
  product.deltas = left.deltas.slice(0);
};
