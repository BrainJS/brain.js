"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = multiplyElementB;
/**
 * multiplies {left} and {right} weight by {from} recurrence into {left} and {right} recurrence
 * @param {Matrix} from
 * @param {Matrix} left
 * @param {Matrix} right
 */
function multiplyElementB(from, left, right) {
  for (var i = 0, weights = left.weights.length; i < weights; i++) {
    left.recurrence[i] += right.weights[i] * from.recurrence[i];
    right.recurrence[i] += left.weights[i] * from.recurrence[i];
  }
}
//# sourceMappingURL=multiply-element-b.js.map