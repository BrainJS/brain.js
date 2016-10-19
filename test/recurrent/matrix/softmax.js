import assert from 'assert';
import Matrix from '../../../src/recurrent/matrix';
import softmax from '../../../src/recurrent/matrix/softmax';

describe('matrix', function() {
  describe('softmax', function() {
    context('when given a left and right matrix both of 2 rows and 2 columns', function() {
      it('correctly multiplies the values', function() {
        var m1 = softmax(Matrix.fromArray([
          [2, 2],
          [2, 2]
        ]));
        m1.weights.forEach(function(value) {
          assert.equal(value, 0.25);
        });
      });
    });
  });
});