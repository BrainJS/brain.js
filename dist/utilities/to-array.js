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
  values = values || [];
  if (Array.isArray(values)) {
    return values;
  } else {
    return Object.keys(values).map(function (key) {
      return values[key];
    });
  }
}
//# sourceMappingURL=to-array.js.map