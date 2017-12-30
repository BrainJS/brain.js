"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clipByValue = clipByValue;
exports.isClippedByValue = isClippedByValue;
function clipByValue(value, max, min) {
  if (value > max) {
    return max;
  }
  if (value < min) {
    return min;
  }
  return value;
}

function isClippedByValue(value, max, min) {
  if (value > max) {
    return 1;
  }
  if (value < min) {
    return 1;
  }
  return 0;
}
//# sourceMappingURL=gradient-clip.js.map