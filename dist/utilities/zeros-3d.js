'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = zeros3D;

var _zeros2d = require('./zeros-2d');

var _zeros2d2 = _interopRequireDefault(_zeros2d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function zeros3D(width, height, depth) {
  var result = new Array(depth);
  for (var z = 0; z < depth; z++) {
    result[z] = (0, _zeros2d2.default)(width, height);
  }
  return result;
}