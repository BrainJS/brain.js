import assert from 'assert';
import Matrix from '../../../src/recurrent/matrix';
import multiply from '../../../src/recurrent/matrix/multiply';
import multiplyB from '../../../src/recurrent/matrix/multiply-b';

describe('matrix', () => {
  describe('multiply', () => {
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
        var result = new Matrix(2, 2);
        multiply(result, m1, m2);
        var weights = [8, 8, 8, 8];
        assert.equal(result.weights.length, 4);
        result.weights.forEach((value, i) => {
          assert.equal(value, weights[i]);
        });
      });
    });
  });

  describe('multiplyB', () => {
    context('when given a left and right matrix both of 2 rows and 2 columns', () => {
      it('correctly multiplies the values', () => {
        var m1 = Matrix.fromArray([
          [3, 3],
          [3, 3]
        ]);
        var m2 = Matrix.fromArray([
          [3, 3],
          [3, 3]
        ]);
        var result = Matrix.fromArray([
          [3, 3],
          [3, 3]
        ]);
        multiplyB(result, m1, m2);
        m1.deltas.forEach((value) => {
          assert.equal(value, 21);
        });
        m2.deltas.forEach((value) => {
          assert.equal(value, 21);
        });
      });
    });
  });
});