"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = copy;
/**
 *
 * @param {Matrix} into
 * @param {Matrix} m
 */
function copy(into, m) {
  into.rows = parseInt(m.rows);
  into.columns = parseInt(m.columns);
  into.weights = m.weights.slice(0);
  into.recurrence = m.recurrence.slice(0);
}
//# sourceMappingURL=copy.js.map