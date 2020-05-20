/**
 * sigmoid activation
 * @param value
 * @returns {number}
 */
function activate(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

/**
 * sigmoid derivative
 * @param weight
 * @param error
 * @returns {number}
 */
function measure(weight: number, error: number): number {
  return weight * (1 - weight) * error;
}
export default {
  activate,
  measure
}

