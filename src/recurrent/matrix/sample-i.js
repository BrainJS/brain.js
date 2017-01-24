import { randomF as _randomF } from '../../utilities/random';

//prevent parser from renaming when calling toString() method later
const randomF = _randomF;
/**
 *
 * @param {Matrix} m
 * @returns {number}
 */
export default function sampleI(m) {
  // sample argmax from w, assuming w are
  // probabilities that sum to one
  let r = randomF(0, 1);
  let x = 0;
  let i = 0;
  let w = m.weights;

  while (true) {
    x += w[i];
    if(x > r) {
      return i;
    }
    i++;
  }
}