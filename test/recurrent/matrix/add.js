import assert from 'assert';
import Matrix from '../../../src/recurrent/matrix';
import add from '../../../src/recurrent/matrix/add';
import addB from '../../../src/recurrent/matrix/add-b';

describe('matrix', () => {
  describe('add', () => {
    context('when given a left and right matrix both of 2 rows and 2 columns', () => {
      it('', () => {
        var m1 = Matrix.fromArray([
          [0, 2],
          [4, 6]
        ]);
        var m2 = Matrix.fromArray([
          [0, 2],
          [4, 6]
        ]);
        var result = new Matrix(2, 2);
        add(result, m1, m2);
        var weights = [0, 4, 8, 12];
        assert.equal(result.weights.length, 4);
        result.weights.forEach((value, i) => {
          assert.equal(value, weights[i]);
        });
      });
    });
  });

  describe('addB', () => {
    context('when given a left and right matrix both of 2 rows and 2 columns', () => {
      it('', () => {
        var m1 = new Matrix(2, 2);
        var m2 = new Matrix(2, 2);
        var result = Matrix.fromArray([
          [0, 2],
          [4, 6]
        ]);
        addB(result, m1, m2);
        var deltas = [0, 2, 4, 6];

        assert.equal(m1.deltas.length, 4);
        m1.deltas.forEach((value, i) => {
          assert.equal(value, deltas[i]);
        });
        assert.equal(m2.deltas.length, 4);
        m2.deltas.forEach((value, i) => {
          assert.equal(value, deltas[i]);
        });
      });
    });
  });
});