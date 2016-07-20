var Matrix = require('./');

/**
 * multiply matrices m1 * m2
 * @param {Matrix} left
 * @param {Matrix} right
 * @returns {Matrix}
 */
module.exports = function multiply(left, right) {
  if (left.rows !== right.columns) throw new Error('misaligned matrices');

  var leftRows = left.rows;
  var leftColumns = left.columns;
  var rightColumns = right.columns;

  var result = new Matrix(leftRows, rightColumns);

  // loop over rows of left
  for(var leftRow = 0; leftRow < leftRows; leftRow++) {

    // loop over cols of right
    for(var rightColumn = 0; rightColumn < rightColumns; rightColumn++) {

      // dot product loop
      var dot = 0.0;

      //loop over columns of left
      for(var leftColumn = 0; leftColumn < leftColumns; leftColumn++) {
        dot +=
          left.weights[leftColumns * leftRow + leftColumn]
          * right.weights[rightColumns * leftColumn + rightColumn];
      }
      result.weights[rightColumns * leftRow + rightColumn] = dot;
    }
  }

  return result;
};
