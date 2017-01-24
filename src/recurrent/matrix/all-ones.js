/**
 * makes matrix weights and recurrence all ones
 * @param {Matrix} product
 */
export default function allOnes(product) {
  for(let i = 0; i < product.weights.length; i++) {
    product.weights[i] = 1;
    product.recurrence[i] = 0;
  }
}
