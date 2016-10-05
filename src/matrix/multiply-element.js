/**
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
export default function multiplyElement(product, left, right) {
  for(let i = 0, weights = left.weights.length; i < weights; i++) {
    product.weights[i] = left.weights[i] * right.weights[i];
    product.recurrence[i] = 0;
    left.recurrence[i] = 0;
    right.recurrence[i] = 0;
  }
}
