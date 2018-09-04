'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = values3D;

var _values2d = require('./values-2d');

var _values2d2 = _interopRequireDefault(_values2d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function values3D(width, height, depth, value) {
  var result = new Array(depth);
  for (var z = 0; z < depth; z++) {
    result[z] = (0, _values2d2.default)(width, height, value);
  }
  return result;
}