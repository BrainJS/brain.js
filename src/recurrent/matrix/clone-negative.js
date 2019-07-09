/**
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
module.exports = function cloneNegative(product, left) {
  product.rows = parseInt(left.rows, 10);
  product.columns = parseInt(left.columns, 10);
  product.weights = left.weights.slice(0);
  product.deltas = left.deltas.slice(0);
  for (let i = 0; i < left.weights.length; i++) {
    product.weights[i] = -left.weights[i];
    product.deltas[i] = 0;
  }
}
