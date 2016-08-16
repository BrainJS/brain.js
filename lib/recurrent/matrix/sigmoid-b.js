var Matrix = require('./');

/**
 *
 * @param {Matrix} from
 * @param {Matrix} m
 */
module.exports = function sigmoidB(from, m) {
  for(var i = 0, max = m.weights.length; i < max; i++) {
    var mwi = from.weights[i];
    m.recurrence[i] += mwi * (1.0 - mwi) * from.recurrence[i];
  }
};
