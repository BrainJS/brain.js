'use strict';

/**
 *
 * @param weight
 * @returns {number}
 */
export function activate(weight) {
  return Math.tanh(weight);
}

/**
 * @description grad for z = tanh(x) is (1 - z^2)
 * @param weight
 * @param delta
 * @returns {number}
 */
export function derivative(weight, delta) {
  return (1 - weight * weight) * delta;
}
