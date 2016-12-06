'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = max;

var _toArray = require('./to-array');

var _toArray2 = _interopRequireDefault(_toArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @param values
 * @returns {number}
 */
function max(values) {
  return Math.max.apply(Math, (0, _toArray2.default)(values));
}
//# sourceMappingURL=max.js.map