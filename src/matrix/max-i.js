/**
 *
 * @param {Matrix} m
 * @returns {number}
 */
export default function maxI(m) {
  // argmax of array w
  let w = m.weights;
  let maxv = w[0];
  let maxix = 0;
  for (let i = 1, max = w.length; i < max; i++) {
    let v = w[i];
    if (v < maxv) continue;

    maxix = i;
    maxv = v;
  }
  return maxix;
};
