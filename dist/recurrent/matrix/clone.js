'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = clone;

var _ = require('./');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @param {Matrix} m
 */
function clone(m) {
  var cloned = new _2.default();
  cloned.rows = parseInt(m.rows);
  cloned.columns = parseInt(m.columns);
  cloned.weights = m.weights.slice(0);
  cloned.recurrence = m.recurrence.slice(0);
  return cloned;
}
//# sourceMappingURL=clone.js.map
