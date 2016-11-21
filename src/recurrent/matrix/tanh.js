/**
 * @param {Matrix} product
 * @param {Matrix} left
 */
export default function tanh(product, left) {
  // tanh nonlinearity
  for(let i = 0, max = left.weights.length; i < max; i++) {
    product.weights[i] = Math.tanh(left.weights[i]);
  }
}
