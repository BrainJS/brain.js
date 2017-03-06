/**
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
export default function multiplyElement(product, left, right) {
  const { weights } = left;
  for(let i = 0; i < weights.length; i++) {
    product.weights[i] = left.weights[i] * right.weights[i];
    product.deltas[i] = 0;
  }
}
