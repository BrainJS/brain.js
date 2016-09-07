var randf = require('../random').f;

/**
 *
 * @param {Matrix} m
 * @returns {number}
 */
export default function sampleI(m) {
  // sample argmax from w, assuming w are
  // probabilities that sum to one
  var r = randf(0, 1);
  var x = 0;
  var i = 0;
  var w = m.weights;

  while (true) {
    x += w[i];
    if(x > r) {
      return i;
    }
    i++;
  }
}