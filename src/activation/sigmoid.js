'use strict';

/**
 *
 * @param value
 * @returns {number}
 */
export function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

/**
 *
 * @param weight
 * @param error
 * @returns {number}
 */
export function sigmoidDerivative(weight, error) {
  return weight * (1 - weight) * error;
}