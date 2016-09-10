'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ones;
function ones(size) {
  if (typeof Float64Array !== 'undefined') return new Float64Array(size).fill(1);
  var array = new Array(size);
  for (var i = 0; i < size; i++) {
    array[i] = i;
  }
  return array;
}
//# sourceMappingURL=ones.js.map