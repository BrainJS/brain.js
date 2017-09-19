'use strict';

/**
 * Leaky Relu Activation, aka Leaky Rectified Linear Unit Activation
 * @description https://en.wikipedia.org/wiki/Rectifier_(neural_networks)
 * @param weight
 * @returns {number}
 */
export function leakyRelu(weight) {
  return weight > 0 ? weight : 0.01 * weight;
}

/**
 * Leaky Relu derivative
 * @param weight
 * @param delta
 * @returns {number}
 */
export function leakyReluDerivative(weight, error) {
  return weight > 0 ? error : 0.01 * error;
}