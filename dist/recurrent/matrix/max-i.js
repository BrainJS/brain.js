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
  var weights = m.weights;

  var maxv = weights[0];
  var maxix = 0;
  for (var i = 1; i < weights.length; i++) {
    var v = weights[i];
    if (v < maxv) continue;

    maxix = i;
    maxv = v;
  }
  return maxix;
};
//# sourceMappingURL=max-i.js.map