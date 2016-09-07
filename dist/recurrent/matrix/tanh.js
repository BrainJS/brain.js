"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = tanh;
/**
 * @param {Matrix} into
 * @param {Matrix} m
 */
function tanh(into, m) {
  // tanh nonlinearity
  for (var i = 0, max = m.weights.length; i < max; i++) {
    into.weights[i] = Math.tanh(m.weights[i]);
    into.recurrence[i] = 0;
  }
}
//# sourceMappingURL=tanh.js.map
