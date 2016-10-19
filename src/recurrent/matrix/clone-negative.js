/**
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
export default function cloneNegative(product, left) {
  product.rows = parseInt(left.rows);
  product.columns = parseInt(left.columns);
  product.weights = left.weights.slice(0);
  product.recurrence = left.recurrence.slice(0);
  for (let i = 0, max = left.weights.length; i < max; i++) {
    product.weights[i] = -left.weights[i];
    product.recurrence[i] = 0;
  }
}
