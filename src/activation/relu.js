'use strict';

/**
 * Relu Activation, aka Rectified Linear Unit Activation
 * @description https://en.wikipedia.org/wiki/Rectifier_(neural_networks)
 * @param weight
 * @returns {number}
 */
export function relu(weight) {
  return Math.max(0, weight);
}

/**
 * Leaky Relu derivative
 * @param weight
 * @param error
 * @returns {number}
 */
export function reluDerivative(weight, error) {
  return weight > 0 ? error : 0;
}