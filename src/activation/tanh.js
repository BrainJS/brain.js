/**
 *
 * @param weight
 * @returns {number}
 */
function activate(weight) {
  return Math.tanh(weight);
}

/**
 * @description grad for z = tanh(x) is (1 - z^2)
 * @param weight
 * @param error
 * @returns {number}
 */
function measure(weight, error) {
  return (1 - weight * weight) * error;
}

module.exports = { activate, measure };
