"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = range;
/**
 *
 * @param start
 * @param end
 * @returns {Array}
 */
function range(start, end) {
  var result = [];
  for (; start < end; start++) {
    result.push(start);
  }
  return result;
}
//# sourceMappingURL=range.js.map