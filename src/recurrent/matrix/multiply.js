/**
 * multiply {left} and {right} matrix weights to {into}
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
export default function multiply(product, left, right) {
  let leftRows = left.rows;
  let leftColumns = left.columns;
  let rightColumns = right.columns;

  // loop over rows of left
  for(let leftRow = 0; leftRow < leftRows; leftRow++) {

    // loop over cols of right
    for(let rightColumn = 0; rightColumn < rightColumns; rightColumn++) {

      // dot product loop
      let dot = 0;

      //loop over columns of left
      for(let leftColumn = 0; leftColumn < leftColumns; leftColumn++) {
        dot +=
            left.weights[leftColumns * leftRow + leftColumn]
          * right.weights[rightColumns * leftColumn + rightColumn];
      }
      let i = rightColumns * leftRow + rightColumn;
      product.weights[i] = dot;
    }
  }
}
