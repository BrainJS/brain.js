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
  } else {
    var keys = Object.keys(values);
    var result = new Float32Array(keys.length);
    for (var i in keys) {
      result[i] = values[keys[i]];
    }
    return result;
  }
}
//# sourceMappingURL=to-array.js.map