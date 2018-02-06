import assert from 'assert';
import Matrix from '../../../src/recurrent/matrix';

describe('matrix', () => {
  it('.fromArray', () => {
    var m1 = Matrix.fromArray([
      [2, 2],
      [2, 2]
    ]);

    assert.equal(m1.weights.length, 4);
    assert.equal(m1.deltas.length, 4);
    m1.weights.forEach(function(value, i) {
      assert.equal(value, 2);
      assert.equal(m1.deltas[i], 2);
    });
  });

  describe('instantiation', () => {
    context('when given 5 rows and 5 columns', () => {
      it('will have a weight and deltas length of 25', () => {
        var m = new Matrix(5, 5);
        assert.equal(m.weights.length, 25);
        assert.equal(m.deltas.length, 25);
      });
    });
  });
});