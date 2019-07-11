/**
 *
 * @param weight
 * @returns {number}
 */
function tanh(weight) {
  return Math.tanh(weight);
}

/**
 * @description grad for z = tanh(x) is (1 - z^2)
 * @param weight
 * @param error
 * @returns {number}
 */
function tanhDerivative(weight, error) {
  return (1 - weight * weight) * error;
}

module.exports = { tanh, tanhDerivative };
