"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cloneNegative;
/**
 *
 * @param {Matrix} into
 * @param {Matrix} m
 */
function cloneNegative(into, m) {
  into.rows = parseInt(m.rows);
  into.columns = parseInt(m.columns);
  into.weights = m.weights.slice(0);
  into.recurrence = m.recurrence.slice(0);
  for (var i = 0, max = m.weights.length; i < max; i++) {
    into.weights[i] = -m.weights[i];
    into.recurrence[i] = 0;
  }
}
//# sourceMappingURL=clone-negative.js.map