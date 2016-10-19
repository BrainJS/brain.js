/**
 *
 * relu {m} weights to {into} weights
 * @param {Matrix} product
 * @param {Matrix} left
 */
export default function relu(product, left) {
  for(let i = 0, max = left.weights.length; i < max; i++) {
    product.weights[i] = Math.max(0, left.weights[i]); // relu

    //TODO: needed?
    product.recurrence[i] = 0;
    left.recurrence[i] = 0;
  }
}
