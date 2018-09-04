'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = values2D;

var _values = require('./values');

var _values2 = _interopRequireDefault(_values);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function values2D(width, height, value) {
  var result = new Array(height);
  for (var y = 0; y < height; y++) {
    result[y] = (0, _values2.default)(width, value);
  }
  return result;
}