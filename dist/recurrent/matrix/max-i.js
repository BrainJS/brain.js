"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = maxI;
/**
 *
 * @param {Matrix} m
 * @returns {number}
 */
function maxI(m) {
  // argmax of array w
  var w = m.weights;
  var maxv = w[0];
  var maxix = 0;
  for (var i = 1, max = w.length; i < max; i++) {
    var v = w[i];
    if (v < maxv) continue;

    maxix = i;
    maxv = v;
  }
  return maxix;
};
//# sourceMappingURL=max-i.js.map