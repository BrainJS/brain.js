"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = allOnes;
/**
 * makes matrix weights and recurrence all ones
 * @param {Matrix} m
 */
function allOnes(m) {
  for (var i = 0, max = m.weights.length; i < max; i++) {
    m.weights[i] = 1;
    m.recurrence[i] = 0;
  }
}
//# sourceMappingURL=all-ones.js.map