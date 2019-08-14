/**
 * Relu Activation, aka Rectified Linear Unit Activation
 * @description https://en.wikipedia.org/wiki/Rectifier_(neural_networks)
 * @param weight
 * @returns {number}
 */
function activate(weight) {
  return Math.max(0, weight);
}

/**
 * Relu derivative
 * @param weight
 * @param delta
 * @returns {number}
 */
function measure(weight, delta) {
  if (weight <= 0) {
    return 0;
  }
  return delta;
}

module.exports = { activate, measure };
