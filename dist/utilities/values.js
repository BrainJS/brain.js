"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = values;
function values(size, value) {
  return new Float32Array(size).fill(value);
}