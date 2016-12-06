'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = softmax;

var _ = require('./');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//prevent parser from renaming when calling toString() method later
var Matrix = _2.default;
/**
 *
 * @param {Matrix} m
 * @returns {Matrix}
 */
function softmax(m) {
  var result = new Matrix(m.rows, m.columns); // probability volume
  var maxVal = -999999;
  var i = void 0;
  var max = m.weights.length;

  for (i = 0; i < max; i++) {
    if (m.weights[i] > maxVal) {
      maxVal = m.weights[i];
    }
  }

  var s = 0;
  for (i = 0; i < max; i++) {
    result.weights[i] = Math.exp(m.weights[i] - maxVal);
    s += result.weights[i];
  }

  for (i = 0; i < max; i++) {
    result.weights[i] /= s;
  }

  // no backward pass here needed
  // since we will use the computed probabilities outside
  // to set gradients directly on m
  return result;
}
//# sourceMappingURL=softmax.js.map