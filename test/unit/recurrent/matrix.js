var assert = require('assert');
var Matrix = require('../../../lib/recurrent/matrix');
var add = require('../../../lib/recurrent/matrix/add');
var addB = require('../../../lib/recurrent/matrix/add-b');
var multiply = require('../../../lib/recurrent/matrix/multiply');
var multiplyB = require('../../../lib/recurrent/matrix/multiply-b');
var multiplyElement = require('../../../lib/recurrent/matrix/multiply-element');
var multiplyElementB = require('../../../lib/recurrent/matrix/multiply-element-b');

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
        assert(value === i * 2)
      });
      m2.weights.forEach(function(value, i) {
        assert(value === i * 2)
      });
    });
  });

  describe('instantiation', function() {
    context('when given 5 rows and 5 columns', function() {
      it('will have a weight and  and length of 25', function() {
        var m = new Matrix(5, 5);
        assert(m.weights.length === 25);
        assert(m.recurrence.length === 25);
      });
    });
  });

  describe('add', function() {
    context('when given a left and right matrix both of 2 rows and 2 columns', function() {
      it('', function() {
        var m1 = makeFakeMatrix(2, 2);
        var m2 = makeFakeMatrix(2, 2);
        var result = add(m1, m2);
        var weights = {
          '0':0,
          '1':4,
          '2':8,
          '3':12
        };
        assert(result.weights.length === 4);
        result.weights.forEach(function(value, i) {
          assert(value === weights[i]);
        });
      });
    });
  });

  describe('addB', function() {
    context('when given a left and right matrix both of 2 rows and 2 columns', function() {
      it('', function() {
        var m1 = makeFakeMatrix(2, 2);
        var m2 = makeFakeMatrix(2, 2);
        var fakeNeuralNet = { backprop: [] };
        var result = addB(m1, m2, fakeNeuralNet);
        var weights = {
          '0':0,
          '1':4,
          '2':8,
          '3':12
        };
        var recurrence = {
          '0':0,
          '1':1,
          '2':2,
          '3':3
        };

        while (fakeNeuralNet.backprop.length > 0) {
          fakeNeuralNet.backprop.pop()();
        }

        assert(result.weights.length === 4);
        result.weights.forEach(function(value, i) {
          assert(value === weights[i]);
        });
        assert(m1.recurrence.length === 4);
        m1.recurrence.forEach(function(value, i) {
          assert(value === recurrence[i]);
        });
        assert(m2.recurrence.length === 4);
        m2.recurrence.forEach(function(value, i) {
          assert(value === recurrence[i]);
        });
      });
    });
  });

  describe('multiply', function() {
    context('when given a left and right matrix both of 2 rows and 2 columns', function() {
      it('correctly multiplies the values', function() {
        var m1 = makeFakeMatrix(2, 2);
        var m2 = makeFakeMatrix(2, 2);
        var result = multiply(m1, m2);
        var weights = {
          '0':8,
          '1':12,
          '2':24,
          '3':44
        };
        assert(result.weights.length === 4);
        result.weights.forEach(function(value, i) {
          assert(value === weights[i]);
        });
      });
    });
  });

  describe('multiplyB', function() {
    context('when given a left and right matrix both of 2 rows and 2 columns', function() {
      it('correctly multiplies the values', function() {
        var m1 = makeFakeMatrix(2, 2);
        var m2 = makeFakeMatrix(2, 2);
        var fakeNeuralNet = { backprop: [] };
        var result = multiplyB(m1, m2, fakeNeuralNet);
        var weights = {
          '0':8,
          '1':12,
          '2':24,
          '3':44
        };
        result.recurrence.forEach(function(_, i) {
          result.recurrence[i] = 2;
        });
        while (fakeNeuralNet.backprop.length > 0) {
          fakeNeuralNet.backprop.pop()();
        }
        assert(result.weights.length === 4);
        result.weights.forEach(function(value, i) {
          assert(value === weights[i]);
        });

        var m1Recurrence = { '0': 4, '1': 21, '2': 6, '3': 23 };
        assert(m1.recurrence.length === 4);
        m1.recurrence.forEach(function(value, i) {
          assert(value === m1Recurrence[i]);
        });
        var m2Recurrence = { '0': 8, '1': 9, '2': 18, '3': 19 };
        assert(m2.recurrence.length === 4);
        m2.recurrence.forEach(function(value, i) {
          assert(value === m2Recurrence[i]);
        });
      });
    });
  });

  describe('multiplyElement', function() {
    context('when given a left and right matrix both of 2 rows and 2 columns', function() {
      it('correctly multiplies the values', function() {
        var m1 = makeFakeMatrix(2, 2);
        var m2 = makeFakeMatrix(2, 2);
        var result = multiplyElement(m1, m2);
        var weights = {
          '0':0,
          '1':4,
          '2':16,
          '3':36
        };
        assert(result.weights.length === 4);
        result.weights.forEach(function(value, i) {
          assert(value === weights[i]);
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
        var fakeNeuralNet = { backprop: [] };
        var result = multiplyElementB(m1, m2, fakeNeuralNet);
        var weights = {
          '0':0,
          '1':5,
          '2':10,
          '3':15
        };
        result.recurrence.forEach(function(_, i) {
          result.recurrence[i] = 2;
        });
        while(fakeNeuralNet.backprop.length > 0) {
          fakeNeuralNet.backprop.pop()();
        }
        assert(m1.recurrence.length === 4);
        m1.recurrence.forEach(function(value, i) {
          assert(value === weights[i]);
        });

        assert(m2.recurrence.length === 4);
        m2.recurrence.forEach(function(value, i) {
          assert(value === weights[i]);
        });
      });
    });
  });
});