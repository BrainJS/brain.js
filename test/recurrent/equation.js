import fs from 'fs';
import assert from 'assert';
import sinon from 'sinon';
import Matrix from '../../src/matrix';
import Equation from '../../src/utilities/equation';

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
  describe('multiply', function() {
    it('can multiply two matrices all values of two', function() {
      var equation = new Equation();
      var input = fourSquareMatrix(2);
      equation.multiply(input, fourSquareMatrix(2));
      var output = equation.run();
      output.weights.forEach(function(value) {
        assert.equal(value, 16);
      });
    });
    it('can multiply two matrices nested 3 times, all matrices start with values of two', function() {
      var equation = new Equation();
      var input = fourSquareMatrix(2);
      equation.multiply(equation.multiply(equation.multiply(input, fourSquareMatrix(2)), fourSquareMatrix(2)), fourSquareMatrix(2));
      var output = equation.run();
      output.weights.forEach(function(value) {
        assert.equal(value, 1024);
      });
    });
  });
  describe('add', function() {
    it('can add two matrices nested 3 times, all matrices start with values of one', function() {
      var equation = new Equation();
      var input = fourSquareMatrix(1);
      equation.add(equation.add(equation.add(input, fourSquareMatrix(1)), fourSquareMatrix(1)), fourSquareMatrix(1));
      var output = equation.run();
      output.weights.forEach(function(value) {
        assert.equal(value, 4);
      });
    });
  });
});