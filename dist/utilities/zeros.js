'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = zeros;
function zeros(size) {
  if (typeof Float64Array !== 'undefined') return new Float64Array(size);
  var array = new Array(size);
  for (var i = 0; i < size; i++) {
    array[i] = 0;
  }
  return array;
}
//# sourceMappingURL=zeros.js.map