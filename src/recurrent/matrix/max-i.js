/**
 *
 * @param {Matrix} m
 * @returns {number}
 */
export default function maxI(m) {
  // argmax of array w
  var w = m.weights;
  var maxv = w[0];
  var maxix = 0;
  for (var i = 1, n = w.length; i < n; i++) {
    var v = w[i];
    if (v < maxv) continue;

    maxix = i;
    maxv = v;
  }
  return maxix;
};
