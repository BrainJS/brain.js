"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = multiplyB;
/**
 * multiplies {from} deltas to {left} and {right}
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
function multiplyB(product, left, right) {
  var leftRows = left.rows;
  var leftColumns = left.columns;
  var rightColumns = right.columns;

  // loop over rows of left
  for (var leftRow = 0; leftRow < leftRows; leftRow++) {
    var leftRowBase = leftColumns * leftRow;
    var rightRowBase = rightColumns * leftRow;
    // loop over cols of right
    for (var rightColumn = 0; rightColumn < rightColumns; rightColumn++) {

      //loop over columns of left
      for (var leftColumn = 0; leftColumn < leftColumns; leftColumn++) {
        var rightColumnBase = rightColumns * leftColumn;
        var _leftRow = leftRowBase + leftColumn;
        var rightRow = rightColumnBase + rightColumn;
        var backPropagateValue = product.deltas[rightRowBase + rightColumn];
        left.deltas[_leftRow] += right.weights[rightRow] * backPropagateValue;
        right.deltas[rightRow] += left.weights[_leftRow] * backPropagateValue;
      }
    }
  }
}
//# sourceMappingURL=multiply-b.js.map