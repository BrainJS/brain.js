"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = add;
/**
 * add {left} and {right} matrix weights into {into}
 * @param {Matrix} into
 * @param {Matrix} left
 * @param {Matrix} right
 */
function add(into, left, right) {
  for (var i = 0, max = left.weights.length; i < max; i++) {
    into.weights[i] = left.weights[i] + right.weights[i];
    into.recurrence[i] = 0;
  }
}
//# sourceMappingURL=add.js.map
