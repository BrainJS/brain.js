"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toArray;
/**
 *
 * @param values
 * @returns {*}
 */
function toArray(values) {
  if (Array.isArray(values)) {
    return values;
  }
  return new Float32Array(Object.values(values));
}