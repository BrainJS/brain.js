/**
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
export default function sigmoidB(product, left) {
  for(let i = 0; i < product.deltas.length; i++) {
    let mwi = product.weights[i];
    left.deltas[i] = mwi * (1 - mwi) * product.deltas[i];
  }
}
