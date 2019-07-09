const _randomF = require('../../utilities/random').randomFloat;

// prevent parser from renaming when calling toString() method later
const randomF = _randomF;
/**
 *
 * @param {Matrix} m
 * @returns {number}
 */
module.exports = function sampleI(m) {
  // sample argmax from w, assuming w are
  // probabilities that sum to one
  const r = randomF(0, 1);
  let x = 0;
  let i = 0;
  const w = m.weights;

  while (true) {
    x += w[i];
    if (x > r) {
      return i;
    }
    i++;
  }
}
