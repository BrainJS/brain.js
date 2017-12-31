'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ones;
function ones(size) {
  if (typeof Float32Array !== 'undefined') return new Float32Array(size).fill(1);
  var array = new Array(size);
  for (var i = 0; i < size; i++) {
    array[i] = 1;
  }
  return array;
}
//# sourceMappingURL=ones.js.map