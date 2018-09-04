'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = randos2D;

var _randos = require('./randos');

var _randos2 = _interopRequireDefault(_randos);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function randos2D(width, height) {
  var result = new Array(height);
  for (var y = 0; y < height; y++) {
    result[y] = (0, _randos2.default)(width);
  }
  return result;
}