"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rowPluck;
/**
 * @param {Matrix} into
 * @param {Matrix} m
 * @param {Number} rowIndex
 */
function rowPluck(into, m, rowIndex) {
  for (var column = 0, columns = m.columns; column < columns; column++) {
    into.weights[column] = m.weights[columns * rowIndex + column];
    into.recurrence[column] = 0;
  }
}
//# sourceMappingURL=row-pluck.js.map
