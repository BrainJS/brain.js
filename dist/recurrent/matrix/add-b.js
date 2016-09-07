"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = addB;
/**
 * adds {from} recurrence to {left} and {right} recurrence
 * @param {Matrix} from
 * @param {Matrix} left
 * @param {Matrix} right
 */
function addB(from, left, right) {
  for (var i = 0, max = left.weights.length; i < max; i++) {
    left.recurrence[i] += from.recurrence[i];
    right.recurrence[i] += from.recurrence[i];
  }
}
//# sourceMappingURL=add-b.js.map
