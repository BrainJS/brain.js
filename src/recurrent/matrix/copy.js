import zeros from '../../utilities/zeros';
/*
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
export default function copy(product, left) {
  product.rows = parseInt(left.rows);
  product.columns = parseInt(left.columns);
  product.weights = left.weights.slice(0);
  product.recurrence = left.recurrence.slice(0);
}
