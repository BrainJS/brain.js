/**
 *
 * @param weight
 * @returns {number}
 */
function activate(weight: number): number {
  return Math.tanh(weight);
}

/**
 * @description grad for z = tanh(x) is (1 - z^2)
 * @param weight
 * @param error
 * @returns {number}
 */
function measure(weight: number, error: number): number {
  return (1 - weight * weight) * error;
}

export default {
  activate,
  measure
}

