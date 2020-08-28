/**
 * Relu Activation, aka Rectified Linear Unit Activation
 * @description https://en.wikipedia.org/wiki/Rectifier_(neural_networks)
 */
export function activate(weight: number): number {
  return Math.max(0, weight);
}

/**
 * Relu derivative
 */
export function measure(weight: number, delta: number): number {
  if (weight <= 0) {
    return 0;
  }
  return delta;
}
