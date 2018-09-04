'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = randos3D;

var _randos2d = require('./randos-2d');

var _randos2d2 = _interopRequireDefault(_randos2d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function randos3D(width, height, depth) {
  var result = new Array(depth);
  for (var z = 0; z < depth; z++) {
    result[z] = (0, _randos2d2.default)(width, height);
  }
  return result;
}