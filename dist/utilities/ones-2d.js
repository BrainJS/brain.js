'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ones2D;

var _ones = require('./ones');

var _ones2 = _interopRequireDefault(_ones);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ones2D(width, height) {
  var result = new Array(height);
  for (var y = 0; y < height; y++) {
    result[y] = (0, _ones2.default)(width);
  }
  return result;
}