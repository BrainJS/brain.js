/**
 * @param {Matrix} product
 * @param {Matrix} left
 */
export default function tanh(product, left) {
  // tanh nonlinearity
  for(let i = 0; i < left.weights.length; i++) {
    product.weights[i] = Math.tanh(left.weights[i]);
    product.deltas[i] = 0;
  }
}
