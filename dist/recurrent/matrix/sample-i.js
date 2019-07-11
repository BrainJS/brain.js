'use strict';

var _randomF = require('../../utilities/random').randomFloat;

// prevent parser from renaming when calling toString() method later
var randomF = _randomF;
/**
 *
 * @param {Matrix} m
 * @returns {number}
 */
module.exports = function sampleI(m) {
  // sample argmax from w, assuming w are
  // probabilities that sum to one
  var r = randomF(0, 1);
  var x = 0;
  var i = 0;
  var w = m.weights;

  while (true) {
    x += w[i];
    if (x > r) {
      return i;
    }
    i++;
  }
};