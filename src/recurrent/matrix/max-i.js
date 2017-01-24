/**
 *
 * @param {Matrix} m
 * @returns {number}
 */
export default function maxI(m) {
  // argmax of array w
  let { weights } = m;
  let maxv = weights[0];
  let maxix = 0;
  for (let i = 1; i < weights.length; i++) {
    let v = weights[i];
    if (v < maxv) continue;

    maxix = i;
    maxv = v;
  }
  return maxix;
};
