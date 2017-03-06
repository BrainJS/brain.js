/**
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
export default function cloneNegative(product, left) {
  product.rows = parseInt(left.rows);
  product.columns = parseInt(left.columns);
  product.weights = left.weights.slice(0);
  product.deltas = left.deltas.slice(0);
  for (let i = 0; i < left.weights.length; i++) {
    product.weights[i] = -left.weights[i];
    product.deltas[i] = 0;
  }
}
