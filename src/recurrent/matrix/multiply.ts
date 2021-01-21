import { Matrix } from '.';

/**
 * multiply {left} and {right} matrix weights to {into}
 */
export function multiply(product: Matrix, left: Matrix, right: Matrix): void {
  const leftRows = left.rows;
  const leftColumns = left.columns;
  const rightColumns = right.columns;

  // loop over rows of left
  for (let leftRow = 0; leftRow < leftRows; leftRow++) {
    const leftRowBase = leftColumns * leftRow;
    const rightRowBase = rightColumns * leftRow;

    // loop over cols of right
    for (let rightColumn = 0; rightColumn < rightColumns; rightColumn++) {
      // dot product loop
      let dot = 0;

      // loop over columns of left
      for (let leftColumn = 0; leftColumn < leftColumns; leftColumn++) {
        const rightColumnBase = rightColumns * leftColumn;
        const leftIndex = leftRowBase + leftColumn;
        const rightIndex = rightColumnBase + rightColumn;
        dot += left.weights[leftIndex] * right.weights[rightIndex];
        left.deltas[leftIndex] = 0;
        right.deltas[rightIndex] = 0;
      }

      product.weights[rightRowBase + rightColumn] = dot;
    }
  }
}
