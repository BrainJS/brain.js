"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = multiply;
/**
 * multiply {left} and {right} matrix weights to {into}
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
function multiply(product, left, right) {
  var leftRows = left.rows;
  var leftColumns = left.columns;
  var rightColumns = right.columns;

  // loop over rows of left
  for (var leftRow = 0; leftRow < leftRows; leftRow++) {
    var leftRowBase = leftColumns * leftRow;
    var rightRowBase = rightColumns * leftRow;
    // loop over cols of right
    for (var rightColumn = 0; rightColumn < rightColumns; rightColumn++) {

      // dot product loop
      var dot = 0;
      //loop over columns of left
      for (var leftColumn = 0; leftColumn < leftColumns; leftColumn++) {
        var rightColumnBase = rightColumns * leftColumn;
        var leftIndex = leftRowBase + leftColumn;
        var rightIndex = rightColumnBase + rightColumn;
        dot += left.weights[leftIndex] * right.weights[rightIndex];
        left.deltas[leftIndex] = 0;
        right.deltas[rightIndex] = 0;
      }
      product.weights[rightRowBase + rightColumn] = dot;
    }
  }
}
//# sourceMappingURL=multiply.js.map