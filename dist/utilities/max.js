'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = max;

var _toArray = require('./to-array');

var _toArray2 = _interopRequireDefault(_toArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 *
 * @param values
 * @returns {number}
 */
function max(values) {
  return Math.max.apply(Math, _toConsumableArray((0, _toArray2.default)(values)));
}