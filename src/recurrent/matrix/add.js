/**
 * add {left} and {right} matrix weights into {into}
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
export default function add(product, left, right) {
  for(let i = 0, max = left.weights.length; i < max; i++) {
    product.weights[i] = left.weights[i] + right.weights[i];
  }
}
