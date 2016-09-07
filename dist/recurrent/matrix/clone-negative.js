'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cloneNegative;

var _ = require('./');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @param {Matrix} m
 */
function cloneNegative(m) {
  var cloned = new _2.default();
  cloned.rows = parseInt(m.rows);
  cloned.columns = parseInt(m.columns);

  for (var i = 0, max = m.weights.length; i < max; i++) {
    cloned.weights[i] = -m.weights[i];
    cloned.recurrence[i] = -m.recurrence[i];
  }
  return cloned;
}
//# sourceMappingURL=clone-negative.js.map
