/**
 * Relu Activation, aka Rectified Linear Unit Activation
 * @description https://en.wikipedia.org/wiki/Rectifier_(neural_networks)
 * @param weight
 * @returns {number}
 */
export function activate(weight) {
  return Math.max(0, weight);
}

/**
 * Leaky Relu derivative
 * @param weight
 * @param delta
 * @returns {number}
 */
export function measure(weight, delta) {
  if (weight <= 0) {
    return 0;
  } else {
    return delta;
  }
}