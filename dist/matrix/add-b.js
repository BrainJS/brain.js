"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = addB;
/**
 * adds {from} recurrence to {left} and {right} recurrence
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
function addB(product, left, right) {
  for (var i = 0, max = left.recurrence.length; i < max; i++) {
    left.recurrence[i] += product.recurrence[i];
    right.recurrence[i] += product.recurrence[i];
  }
}
//# sourceMappingURL=add-b.js.map