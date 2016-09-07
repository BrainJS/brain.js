/**
 * multiplies {from} recurrence to {left} and {right}
 * @param {Matrix} from
 * @param {Matrix} left
 * @param {Matrix} right
 */
export default function multiplyB(from, left, right) {
  let leftRows = left.rows;
  let leftColumns = left.columns;
  let rightColumns = right.columns;

  // loop over rows of left
  for(let leftRow = 0; leftRow < leftRows; leftRow++) {

    // loop over cols of right
    for(let rightColumn = 0; rightColumn < rightColumns; rightColumn++) {

      //loop over columns of left
      for(let leftColumn = 0; leftColumn < leftColumns; leftColumn++) {
        let backPropagateValue = from.recurrence[rightColumns * leftRow + rightColumn];
        left.recurrence[leftColumns * leftRow + leftColumn] += right.weights[rightColumns * leftColumn + rightColumn] * backPropagateValue;
        right.recurrence[rightColumns * leftColumn + rightColumn] += left.weights[leftColumns * leftRow + leftColumn] * backPropagateValue;
      }
    }
  }
}
