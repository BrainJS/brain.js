/**
 * sigmoid activation
 * @param value
 * @returns {number}
 */
export function activate(value) {
  return 1 / (1 + Math.exp(-value))
}

/**
 * sigmoid derivative
 * @param weight
 * @param error
 * @returns {number}
 */
export function measure(weight, error) {
  return weight * (1 - weight) * error
}
