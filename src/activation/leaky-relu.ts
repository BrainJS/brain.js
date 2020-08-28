/**
 * Leaky Relu Activation, aka Leaky Rectified Linear Unit Activation
 * @description https://en.wikipedia.org/wiki/Rectifier_(neural_networks)
 */
export function activate(weight: number): number {
  return weight > 0 ? weight : 0.01 * weight;
}

/**
 * Leaky Relu derivative
 */
export function measure(weight: number, error: number) {
  return weight > 0 ? error : 0.01 * error;
}
