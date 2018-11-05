"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = mse;
function mse(errors) {
  // mean squared error
  var sum = 0;
  for (var i = 0; i < errors.length; i++) {
    sum += errors[i] * errors[i];
  }
  return sum / errors.length;
}
//# sourceMappingURL=mse.js.map