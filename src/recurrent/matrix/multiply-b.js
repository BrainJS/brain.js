/**
 * multiplies {from} deltas to {left} and {right}
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
export default function multiplyB(product, left, right) {
  const leftRows = left.rows;
  const leftColumns = left.columns;
  const rightColumns = right.columns;

  // loop over rows of left
  for(let leftRow = 0; leftRow < leftRows; leftRow++) {
    const leftRowBase = leftColumns * leftRow;
    const rightRowBase = rightColumns * leftRow;
    // loop over cols of right
    for(let rightColumn = 0; rightColumn < rightColumns; rightColumn++) {

      //loop over columns of left
      for(let leftColumn = 0; leftColumn < leftColumns; leftColumn++) {
        const rightColumnBase = rightColumns * leftColumn;
        const leftRow = leftRowBase + leftColumn;
        const rightRow = rightColumnBase + rightColumn;
        const backPropagateValue = product.deltas[rightRowBase + rightColumn];
        left.deltas[leftRow] += right.weights[rightRow] * backPropagateValue;
        right.deltas[rightRow] += left.weights[leftRow] * backPropagateValue;
      }
    }
  }
}
