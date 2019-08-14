/*
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
module.exports = function copy(product, left) {
  product.rows = parseInt(left.rows, 10);
  product.columns = parseInt(left.columns, 10);
  product.weights = left.weights.slice(0);
  product.deltas = left.deltas.slice(0);
};
