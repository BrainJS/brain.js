/**
 * Relu Activation, aka Rectified Linear Unit Activation
 * @description https://en.wikipedia.org/wiki/Rectifier_(neural_networks)
 * @param weight
 * @returns {number}
 */
function activate(weight: number): number {
  return Math.max(0, weight);
}

/**
 * Relu derivative
 * @param weight
 * @param delta
 * @returns {number}
 */
function measure(weight: number, delta: number): number {
  if (weight <= 0) {
    return 0;
  }
  return delta;
}

export default {
  activate,
  measure
}
