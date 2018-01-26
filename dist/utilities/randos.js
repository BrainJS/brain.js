'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = randos;

var _randomWeight = require('./random-weight');

var _randomWeight2 = _interopRequireDefault(_randomWeight);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function randos(size) {
  var array = new Float32Array(size);
  for (var i = 0; i < size; i++) {
    array[i] = (0, _randomWeight2.default)();
  }
  return array;
}
//# sourceMappingURL=randos.js.map