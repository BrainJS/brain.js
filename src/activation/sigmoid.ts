/**
 * sigmoid activation
 */
export function activate(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

/**
 * sigmoid derivative
 */
export function measure(weight: number, error: number): number {
  return weight * (1 - weight) * error;
}
