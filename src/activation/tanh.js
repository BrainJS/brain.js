'use strict';

/**
 *
 * @param weight
 * @returns {number}
 */
export function tanh(weight) {
  return Math.tanh(weight);
}

/**
 * @description grad for z = tanh(x) is (1 - z^2)
 * @param weight
 * @param error
 * @returns {number}
 */
export function tanhDerivative(weight, error) {
  return (1 - weight * weight) * error;
}
