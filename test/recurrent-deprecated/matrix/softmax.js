import assert from 'assert';
import Matrix from '../../../src/recurrent/matrix';
import softmax from '../../../src/recurrent/matrix/softmax';

describe('matrix', () => {
  describe('softmax', () => {
    context('when given a left and right matrix both of 2 rows and 2 columns', () => {
      it('correctly multiplies the values', () => {
        var m1 = softmax(Matrix.fromArray([
          [2, 2],
          [2, 2]
        ]));
        m1.weights.forEach((value) => {
          assert.equal(value, 0.25);
        });
      });
    });
  });
});