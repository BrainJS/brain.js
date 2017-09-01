/*
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
export default function copy(product, left) {
  product.rows = parseInt(left.rows);
  product.columns = parseInt(left.columns);
  product.weights = left.weights.slice(0);
  product.deltas = left.deltas.slice(0);
}
