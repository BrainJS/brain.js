"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = relu;
/**
 *
 * relu {m} weights to {into} weights
 * @param {Matrix} into
 * @param {Matrix} m
 */
function relu(into, m) {
  for (var i = 0, max = m.weights.length; i < max; i++) {
    into.weights[i] = Math.max(0, m.weights[i]); // relu
    into.recurrence[i] = 0;
  }
}
//# sourceMappingURL=relu.js.map
