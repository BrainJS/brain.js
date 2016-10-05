'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sampleI;

var _random = require('../utilities/random');

/**
 *
 * @param {Matrix} m
 * @returns {number}
 */
function sampleI(m) {
  // sample argmax from w, assuming w are
  // probabilities that sum to one
  var r = (0, _random.randomF)(0, 1);
  var x = 0;
  var i = 0;
  var w = m.weights;

  if (isNaN(w[0])) {
    throw new Error('NaN');
  }

  while (true) {
    x += w[i];
    if (x > r) {
      return i;
    }
    i++;
  }
}
//# sourceMappingURL=sample-i.js.map