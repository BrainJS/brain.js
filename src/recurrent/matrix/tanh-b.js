/**
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
module.exports = function tanhB(product, left) {
  for (let i = 0; i < product.deltas.length; i++) {
    // grad for z = tanh(x) is (1 - z^2)
    const mwi = product.weights[i];
    left.deltas[i] = (1 - mwi * mwi) * product.deltas[i];
  }
};
