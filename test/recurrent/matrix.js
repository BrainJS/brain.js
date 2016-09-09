import assert from 'assert';
import Matrix from '../../src/recurrent/matrix';
import add from '../../src/recurrent/matrix/add';
import addB from '../../src/recurrent/matrix/add-b';
import multiply from '../../src/recurrent/matrix/multiply';
import multiplyB from '../../src/recurrent/matrix/multiply-b';
import multiplyElement from '../../src/recurrent/matrix/multiply-element';
import multiplyElementB from '../../src/recurrent/matrix/multiply-element-b';

function makeFakeMatrix(rows, columns) {
  var m = new Matrix(rows, columns);
  m.weights.forEach(function(_, i) {
    m.weights[i] = i * 2;
  });

  m.recurrence.forEach(function(_, i) {
    m.recurrence[i] = i;
  });

  return m;
}

describe('matrix', function() {
  describe('helper function', function() {
    it('sets up correctly', function() {
      var m1 = makeFakeMatrix(2, 2);
      var m2 = makeFakeMatrix(2, 2);
      m1.weights.forEach(function(value, i) {
        assert.equal(value, i * 2)
      });
      m2.weights.forEach(function(value, i) {
        assert.equal(value, i * 2)
      });
    });
  });

  describe('instantiation', function() {
    context('when given 5 rows and 5 columns', function() {
      it('will have a weight and  and length of 25', function() {
        var m = new Matrix(5, 5);
        assert.equal(m.weights.length, 25);
        assert.equal(m.recurrence.length, 25);
      });
    });
  });

  describe('add', function() {
    context('when given a left and right matrix both of 2 rows and 2 columns', function() {
      it('', function() {
        var m1 = makeFakeMatrix(2, 2);
        var m2 = makeFakeMatrix(2, 2);
        var result = new Matrix(2, 2);
        add(result, m1, m2);
        var weights = [0, 4, 8, 12];
        assert.equal(result.weights.length, 4);
        result.weights.forEach(function(value, i) {
          assert.equal(value, weights[i]);
        });
      });
    });
  });

  describe('addB', function() {
    context('when given a left and right matrix both of 2 rows and 2 columns', function() {
      it('', function() {
        var m1 = makeFakeMatrix(2, 2);
        var m2 = makeFakeMatrix(2, 2);
        var result = makeFakeMatrix(2, 2);
        addB(result, m1, m2);
        var recurrence = [0, 2, 4, 6];

        assert.equal(m1.recurrence.length, 4);
        m1.recurrence.forEach(function(value, i) {
          assert.equal(value, recurrence[i]);
        });
        assert.equal(m2.recurrence.length, 4);
        m2.recurrence.forEach(function(value, i) {
          assert.equal(value, recurrence[i]);
        });
      });
    });
  });

  describe('multiply', function() {
    context('when given a left and right matrix both of 2 rows and 2 columns', function() {
      it('correctly multiplies the values', function() {
        var m1 = makeFakeMatrix(2, 2);
        var m2 = makeFakeMatrix(2, 2);
        var result = new Matrix(2, 2);
        multiply(result, m1, m2);
        var weights = [8, 12, 24, 44];
        assert.equal(result.weights.length, 4);
        result.weights.forEach(function(value, i) {
          assert.equal(value, weights[i]);
        });
      });
    });
  });

  describe('multiplyB', function() {
    context('when given a left and right matrix both of 2 rows and 2 columns', function() {
      it('correctly multiplies the values', function() {
        var m1 = makeFakeMatrix(2, 2);
        var m2 = makeFakeMatrix(2, 2);
        var result = new Matrix(2, 2);
        result.recurrence.forEach(function(_, i) {
          result.recurrence[i] = 2;
        });
        var m1RecurrenceCache = m1.recurrence.slice(0);
        var m2RecurrenceCache = m2.recurrence.slice(0);
        var resultRecurrenceCache = result.recurrence.slice(0);
        multiply(result, m1, m2);
        m1.recurrence = m1RecurrenceCache;
        m2.recurrence = m2RecurrenceCache;
        result.recurrence = resultRecurrenceCache;
        multiplyB(result, m1, m2);
        assert.equal(result.recurrence.length, 4);
        result.recurrence.forEach(function(_, i) {
          result.recurrence[i] = 2;
        });
        var m1Recurrence = [4, 21, 6, 23];
        assert.equal(m1.recurrence.length, 4);
        m1.recurrence.forEach(function(value, i) {
          assert.equal(value, m1Recurrence[i]);
        });
        var m2Recurrence = [8, 9, 18, 19];
        assert.equal(m2.recurrence.length, 4);
        m2.recurrence.forEach(function(value, i) {
          assert.equal(value, m2Recurrence[i]);
        });
      });
    });
  });

  describe('multiplyElement', function() {
    context('when given a left and right matrix both of 2 rows and 2 columns', function() {
      it('correctly multiplies the values', function() {
        var m1 = makeFakeMatrix(2, 2);
        var m2 = makeFakeMatrix(2, 2);
        var result = new Matrix(2, 2);
        multiplyElement(result, m1, m2);
        var weights = [0, 4, 16, 36];
        assert.equal(result.weights.length, 4);
        result.weights.forEach(function(value, i) {
          assert.equal(value, weights[i]);
        });
      });
    });
  });

  describe('multiplyElementB', function() {
    //not even yet used
    context('when given a left and right matrix both of 2 rows and 2 columns', function() {
      it('correctly multiplies the values', function() {
        var m1 = makeFakeMatrix(2, 2);
        var m2 = makeFakeMatrix(2, 2);
        var result = new Matrix(2, 2);
        result.recurrence.forEach(function(_, i) {
          result.recurrence[i] = 2;
        });
        multiplyElementB(result, m1, m2);
        var weights = [0, 5, 10, 15];

        assert.equal(m1.recurrence.length, 4);
        m1.recurrence.forEach(function(value, i) {
          assert.equal(value, weights[i]);
        });

        assert.equal(m2.recurrence.length, 4);
        m2.recurrence.forEach(function(value, i) {
          assert.equal(value, weights[i]);
        });
      });
    });
  });
});