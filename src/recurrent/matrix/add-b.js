/**
 * adds {from} deltas to {left} and {right} deltas
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
export default function addB(product, left, right) {
  for(let i = 0; i < product.deltas.length; i++) {
    left.deltas[i] = product.deltas[i];
    right.deltas[i] = product.deltas[i];
  }
}
