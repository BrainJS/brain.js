'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = softmax;

var _ = require('./');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @param {Matrix} m
 * @returns {Matrix}
 */
function softmax(m) {
  var result = new _2.default(m.rows, m.columns); // probability volume
  var maxVal = -999999;
  var i = void 0;
  var max = void 0;

  for (i = 0, max = m.weights.length; i < max; i++) {
    if (m.weights[i] <= maxVal) continue;
    maxVal = m.weights[i];
  }

  var s = 0;
  for (i = 0, max = m.weights.length; i < max; i++) {
    result.weights[i] = Math.exp(m.weights[i] - maxVal);
    s += result.weights[i];
  }

  for (i = 0, max = m.weights.length; i < max; i++) {
    result.weights[i] /= s;
    result.recurrence[i] = 0;
  }

  // no backward pass here needed
  // since we will use the computed probabilities outside
  // to set gradients directly on m
  return result;
}
//# sourceMappingURL=softmax.js.map
