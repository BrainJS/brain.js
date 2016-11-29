import fs from 'fs';
import assert from 'assert';
import sinon from 'sinon';
import Matrix from '../../src/recurrent/matrix';
import OnesMatrix from '../../src/recurrent/matrix/ones-matrix';
import Equation from '../../src/recurrent/matrix/equation';

function randomMath() {
  var left = Math.floor(Math.random() * 10);
  var right = Math.floor(Math.random() * 10);
  return left + '+' + right + '=' + (left + right);
}

function fourSquareMatrix(value) {
  var result = new Matrix(4, 4);
  result.weights.forEach(function(_, i) {
    result.weights[i] = value;
  });
  return result;
}

describe('equation', function() {
  describe('run', function() {
    it('calls all forwardFn properties', function() {
      var equation = new Equation();
      for (var i = 0; i < 10; i++) {
        equation.states.push({
          forwardFn: sinon.spy()
        })
      }
      equation.run();
      equation.states.forEach(function(state) {
        assert(state.forwardFn.called);
      });
    });
  });
  describe('runBack', function() {
    it('calls all forwardFn properties', function() {
      var equation = new Equation();
      for (var i = 0; i < 10; i++) {
        equation.states.push({
          backpropagationFn: sinon.spy()
        })
      }
      equation.runBackpropagate();
      equation.states.forEach(function(state) {
        assert(state.backpropagationFn.called);
      });
    });
  });
  describe('add', function() {
    it('calls forwardFn', function() {
      var equation = new Equation();
      var input = fourSquareMatrix(1);
      equation.add(input, fourSquareMatrix(1));
      assert.equal(equation.states.length, 1);
      sinon.spy(equation.states[0], 'forwardFn');
      equation.run();
      assert(equation.states[0].forwardFn.called);
    });
  });
  describe('multiply', function() {
    it('calls forwardFn', function() {
      var equation = new Equation();
      var input = fourSquareMatrix(1);
      equation.multiply(input, fourSquareMatrix(1));
      assert.equal(equation.states.length, 1);
      sinon.spy(equation.states[0], 'forwardFn');
      equation.run();
      assert(equation.states[0].forwardFn.called);
    });
  });
  describe('multiplyElement', function() {
    it('calls forwardFn', function() {
      var equation = new Equation();
      var input = fourSquareMatrix(1);
      equation.add(input, fourSquareMatrix(1));
      assert.equal(equation.states.length, 1);
      sinon.spy(equation.states[0], 'forwardFn');
      equation.run();
      assert(equation.states[0].forwardFn.called);
    });
  });
  describe('relu', function() {
    it('calls forwardFn', function() {
      var equation = new Equation();
      var input = fourSquareMatrix(1);
      equation.add(input, fourSquareMatrix(1));
      assert.equal(equation.states.length, 1);
      sinon.spy(equation.states[0], 'forwardFn');
      equation.run();
      assert(equation.states[0].forwardFn.called);
    });
  });
  describe('inputMatrixToRow', function() {
    it('calls forwardFn', function() {
      var equation = new Equation();
      var input = fourSquareMatrix(1);
      equation.add(input, fourSquareMatrix(1));
      assert.equal(equation.states.length, 1);
      sinon.spy(equation.states[0], 'forwardFn');
      equation.run();
      assert(equation.states[0].forwardFn.called);
    });
  });
  describe('sigmoid', function() {
    it('calls forwardFn', function() {
      var equation = new Equation();
      var input = fourSquareMatrix(1);
      equation.add(input, fourSquareMatrix(1));
      assert.equal(equation.states.length, 1);
      sinon.spy(equation.states[0], 'forwardFn');
      equation.run();
      assert(equation.states[0].forwardFn.called);
    });
  });
  describe('tanh', function() {
    it('calls forwardFn', function() {
      var equation = new Equation();
      var input = fourSquareMatrix(1);
      equation.add(input, fourSquareMatrix(1));
      assert.equal(equation.states.length, 1);
      sinon.spy(equation.states[0], 'forwardFn');
      equation.run();
      assert(equation.states[0].forwardFn.called);
    });
  });
  describe('nesting', function() {
    it('can nest 3 deep and run forward', function() {
      var equation = new Equation();
      var input = fourSquareMatrix(2);
      equation.multiply(equation.multiply(equation.multiply(input, fourSquareMatrix(2)), fourSquareMatrix(2)), fourSquareMatrix(2));
      assert.equal(equation.states.length, 3);
      sinon.spy(equation.states[0], 'forwardFn');
      sinon.spy(equation.states[1], 'forwardFn');
      sinon.spy(equation.states[2], 'forwardFn');
      equation.run();
      equation.states.forEach(function(state) {
        assert(state.forwardFn.called);
      });
    });
    it('can nest 3 deep and run backward', function() {
      var equation = new Equation();
      var input = fourSquareMatrix(2);
      equation.tanh(equation.multiply(equation.add(input, fourSquareMatrix(2)), fourSquareMatrix(2)), fourSquareMatrix(2));
      assert.equal(equation.states.length, 3);
      sinon.spy(equation.states[0], 'backpropagationFn');
      sinon.spy(equation.states[1], 'backpropagationFn');
      sinon.spy(equation.states[2], 'backpropagationFn');
      equation.runBackpropagate();
      equation.states.forEach(function(state) {
        assert(state.backpropagationFn.called);
      });
    });
  });
  describe('inputMatrixToRow', function() {
    context('run', function() {
      it('can properly split up a matrix', function() {
        var input = new Matrix(2, 2);
        /**
         * Matrix like:
         * 1 1
         * 2 2
         */
        input.weights.forEach(function(w, i) {
          if (i < 2) {
            input.weights[i] = 1;
          } else {
            input.weights[i] = 2;
          }
        });
        var equation = new Equation();
        equation.add(new OnesMatrix(1, 2), equation.inputMatrixToRow(input));
        var output = equation.run();
        assert.equal(output.weights.length, 2);
        assert.equal(output.weights[0], 2);
        assert.equal(output.weights[1], 2);

        output = equation.run(1);
        assert.equal(output.weights.length, 2);
        assert.equal(output.weights[0], 3);
        assert.equal(output.weights[1], 3);
      });
    });
    context('runBackpropagate', function() {
      it('can properly split up a matrix', function() {
        var input = new Matrix(2, 2);
        /**
         * Matrix like:
         * 1 1
         * 2 2
         */
        input.weights.forEach(function(w, i) {
          if (i < 2) {
            input.weights[i] = 1;
          } else {
            input.weights[i] = 2;
          }
        });
        var equation = new Equation();
        equation.add(new OnesMatrix(1, 2), equation.inputMatrixToRow(input));
        var output = equation.run();
        assert.equal(output.weights.length, 2);
        output = equation.run(1);
        assert.equal(output.weights.length, 2);
        output.weights.forEach(function(weight, i) {
          output.recurrence[i] = weight;
        });
        equation.runBackpropagate(1);
        equation.runBackpropagate();
      });
    });
  });
});