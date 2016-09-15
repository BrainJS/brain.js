/**
 * makes matrix weights and recurrence all ones
 * @param {Matrix} product
 */
export default function allOnes(product) {
  for(let i = 0, max = product.weights.length; i < max; i++) {
    product.weights[i] = 1;
    product.recurrence[i] = 0;
  }
}
