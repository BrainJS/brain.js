var Matrix = require('./');

/**
 * creates new Matrix
 * multiplies left and right weights to newly created Matrix weights
 * pushes lambda to rnn.backprop which multiplies new Matrix recurrence to left and right Matrices
 * returns the newly created matrix
 * @param {Matrix} left
 * @param {Matrix} right
 * @param {RNN|*} rnn
 * @returns {Matrix}
 */
module.exports = function multiplyB(left, right, rnn) {
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
        var leftWeight = left.weights[leftColumns * leftRow + leftColumn];
        var rightWeight = right.weights[rightColumns * leftColumn + rightColumn];

        dot += leftWeight * rightWeight;
      }
      result.weights[rightColumns * leftRow + rightColumn] = dot;
    }
  }

  rnn.backprop.push(function() {
    // loop over rows of left
    for(var leftRow = 0; leftRow < leftRows; leftRow++) {

      // loop over cols of right
      for(var rightColumn = 0; rightColumn < rightColumns; rightColumn++) {

        //loop over columns of left
        for(var leftColumn = 0; leftColumn < leftColumns; leftColumn++) {
          var leftWeight = left.weights[leftColumns * leftRow + leftColumn];
          var rightWeight = right.weights[rightColumns * leftColumn + rightColumn];
          var backPropagateValue = result.recurrence[rightColumns * leftRow + rightColumn];
          left.recurrence[leftColumns * leftRow + rightColumn] += rightWeight * backPropagateValue;
          right.recurrence[rightColumns * leftColumn + rightColumn] += leftWeight * backPropagateValue;
        }
      }
    }
  });

  return result;
};
