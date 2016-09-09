"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sigmoidB;
/**
 *
 * @param {Matrix} from
 * @param {Matrix} m
 */
function sigmoidB(from, m) {
  for (var i = 0, max = m.weights.length; i < max; i++) {
    var mwi = from.weights[i];
    m.recurrence[i] += mwi * (1 - mwi) * from.recurrence[i];
  }
}
//# sourceMappingURL=sigmoid-b.js.map