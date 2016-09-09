"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = multiplyB;
/**
 * multiplies {from} recurrence to {left} and {right}
 * @param {Matrix} from
 * @param {Matrix} left
 * @param {Matrix} right
 */
function multiplyB(from, left, right) {
  var leftRows = left.rows;
  var leftColumns = left.columns;
  var rightColumns = right.columns;

  // loop over rows of left
  for (var leftRow = 0; leftRow < leftRows; leftRow++) {

    // loop over cols of right
    for (var rightColumn = 0; rightColumn < rightColumns; rightColumn++) {

      //loop over columns of left
      for (var leftColumn = 0; leftColumn < leftColumns; leftColumn++) {
        var backPropagateValue = from.recurrence[rightColumns * leftRow + rightColumn];
        left.recurrence[leftColumns * leftRow + leftColumn] += right.weights[rightColumns * leftColumn + rightColumn] * backPropagateValue;
        right.recurrence[rightColumns * leftColumn + rightColumn] += left.weights[leftColumns * leftRow + leftColumn] * backPropagateValue;
      }
    }
  }
}
//# sourceMappingURL=multiply-b.js.map