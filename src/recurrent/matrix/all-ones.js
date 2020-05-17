/**
 * makes matrix weights and deltas all ones
 * @param {Matrix} product
 */
module.exports = function allOnes(product) {
  for (let i = 0; i < product.weights.length; i++) {
    product.weights[i] = 1;
    product.deltas[i] = 0;
  }
};
