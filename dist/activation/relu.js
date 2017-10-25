'use strict';

/**
 * Relu Activation, aka Rectified Linear Unit Activation
 * @description https://en.wikipedia.org/wiki/Rectifier_(neural_networks)
 * @param weight
 * @returns {number}
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.relu = relu;
exports.reluDerivative = reluDerivative;
function relu(weight) {
  return Math.max(0, weight);
}

/**
 * Leaky Relu derivative
 * @param weight
 * @param error
 * @returns {number}
 */
function reluDerivative(weight, error) {
  return weight > 0 ? error : 0;
}
//# sourceMappingURL=relu.js.map