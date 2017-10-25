'use strict';

/**
 *
 * @param value
 * @returns {number}
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sigmoid = sigmoid;
exports.sigmoidDerivative = sigmoidDerivative;
function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

/**
 *
 * @param weight
 * @param error
 * @returns {number}
 */
function sigmoidDerivative(weight, error) {
  return weight * (1 - weight) * error;
}
//# sourceMappingURL=sigmoid.js.map