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
  for (var i = 0; i < m.weights.length; i++) {
    if (m.weights[i] > maxVal) {
      maxVal = m.weights[i];
    }
  }

  var s = 0;
  for (var _i = 0; _i < m.weights.length; _i++) {
    result.weights[_i] = Math.exp(m.weights[_i] - maxVal);
    s += result.weights[_i];
  }

  for (var _i2 = 0; _i2 < m.weights.length; _i2++) {
    result.weights[_i2] /= s;
  }

  // no backward pass here needed
  // since we will use the computed probabilities outside
  // to set gradients directly on m
  return result;
}
//# sourceMappingURL=softmax.js.map