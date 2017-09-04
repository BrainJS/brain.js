'use strict';

/**
 *
 * @param value
 * @returns {number}
 */
export function activate(value) {
  return 1 / (1 + Math.exp(-value));
}

/**
 *
 * @param weight
 * @param delta
 * @returns {number}
 */
export function derivative(weight, delta) {
  return weight * (1 - weight) * delta;
}