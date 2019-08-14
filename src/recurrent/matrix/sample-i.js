const { randomFloat } = require('../../utilities/random');

/**
 *
 * @param {Matrix} m
 * @returns {number}
 */
module.exports = function sampleI(m) {
  // sample argmax from w, assuming w are
  // probabilities that sum to one
  const r = randomFloat(0, 1);
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
};
