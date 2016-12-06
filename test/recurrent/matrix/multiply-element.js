import assert from 'assert';
import Matrix from '../../../src/recurrent/matrix';
import multiplyElement from '../../../src/recurrent/matrix/multiply-element';
import multiplyElementB from '../../../src/recurrent/matrix/multiply-element-b';

describe('matrix', () => {
  describe('multiplyElement', () => {
    context('when given a left and right matrix both of 2 rows and 2 columns', () => {
      it('correctly multiplies the values', () => {
        var m1 = Matrix.fromArray([
          [2, 2],
          [2, 2]
        ]);
        var m2 = Matrix.fromArray([
          [2, 2],
          [2, 2]
        ]);
        var result = Matrix.fromArray([
          [4, 4],
          [4, 4]
        ]);
        multiplyElement(result, m1, m2);
        assert.equal(result.weights.length, 4);
        result.weights.forEach((value, i) => {
          assert.equal(value, 4);
        });
      });
    });
  });

  describe('multiplyElementB', () => {
    //not even yet used
    context('when given a left and right matrix both of 2 rows and 2 columns', () => {
      it('correctly multiplies the values', () => {
        var m1 = Matrix.fromArray([
          [2, 2],
          [2, 2]
        ]);
        var m2 = Matrix.fromArray([
          [2, 2],
          [2, 2]
        ]);
        var result = Matrix.fromArray([
          [4, 4],
          [4, 4]
        ]);
        multiplyElementB(result, m1, m2);
        assert.equal(m1.recurrence.length, 4);
        m1.recurrence.forEach((value, i) => {
          assert.equal(value, 10);
        });

        assert.equal(m2.recurrence.length, 4);
        m2.recurrence.forEach((value, i) => {
          assert.equal(value, 10);
        });
      });
    });
  });
});