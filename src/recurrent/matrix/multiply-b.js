/**
 * multiplies {from} deltas to {left} and {right}
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
module.exports = function multiplyB(product, left, right) {
  const leftRows = left.rows;
  const leftColumns = left.columns;
  const rightColumns = right.columns;

  // loop over rows of left
  for (let leftRowRoot = 0; leftRowRoot < leftRows; leftRowRoot++) {
    const leftRowBase = leftColumns * leftRowRoot;
    const rightRowBase = rightColumns * leftRowRoot;
    // loop over cols of right
    for (let rightColumn = 0; rightColumn < rightColumns; rightColumn++) {
      // loop over columns of left
      for (let leftColumn = 0; leftColumn < leftColumns; leftColumn++) {
        const rightColumnBase = rightColumns * leftColumn;
        const leftRow = leftRowBase + leftColumn;
        const rightRow = rightColumnBase + rightColumn;
        const backPropagateValue = product.deltas[rightRowBase + rightColumn];
        left.deltas[leftRow] += right.weights[rightRow] * backPropagateValue;
        right.deltas[rightRow] += left.weights[leftRow] * backPropagateValue;
      }
    }
  }
};
