/**
 * Hyperbolic tan
 */
export function activate(weight: number): number {
  return Math.tanh(weight);
}

/**
 * @description grad for z = tanh(x) is (1 - z^2)
 */
export function measure(weight: number, error: number): number {
  return (1 - weight * weight) * error;
}
