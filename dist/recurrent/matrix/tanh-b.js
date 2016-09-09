"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = tanhB;
/**
 *
 * @param {Matrix} from
 * @param {Matrix} m
 */
function tanhB(from, m) {
  for (var i = 0, max = m.weights.length; i < max; i++) {
    // grad for z = tanh(x) is (1 - z^2)
    var mwi = from.weights[i];
    m.recurrence[i] += (1.0 - mwi * mwi) * from.recurrence[i];
  }
}
//# sourceMappingURL=tanh-b.js.map