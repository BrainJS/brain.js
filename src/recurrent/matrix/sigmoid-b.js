/**
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
module.exports = function sigmoidB(product, left) {
  for (let i = 0; i < product.deltas.length; i++) {
    const mwi = product.weights[i];
    left.deltas[i] = mwi * (1 - mwi) * product.deltas[i];
  }
}
