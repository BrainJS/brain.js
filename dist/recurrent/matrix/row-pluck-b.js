"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rowPluckB;
/**
 * adds {from} recurrence into {m} recurrence
 * @param {Matrix} from
 * @param {Matrix} m
 * @param {Number} row
 */
function rowPluckB(from, m, row) {
  for (var column = 0, columns = m.columns; column < columns; column++) {
    m.recurrence[columns * row + column] += from.recurrence[column];
  }
}
//# sourceMappingURL=row-pluck-b.js.map