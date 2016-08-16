

/**
 *
 * @param {Matrix} from
 * @param {Matrix} m
 */
module.exports = function tanhB(from, m) {
  for(var i=0;i<n;i++) {
    // grad for z = tanh(x) is (1 - z^2)
    var mwi = from.weights[i];
    m.recurrence[i] += (1.0 - mwi * mwi) * from.recurrence[i];
  }
};
