import fs from 'fs';
import assert from 'assert';
import Matrix from '../../../src/recurrent/matrix';
import Equation from '../../../src/recurrent/equation';

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
  describe('add', function() {
    it('can add two matrices with values of one', function() {
      var equation = new Equation();
      var input = fourSquareMatrix(1);
      equation.add(input, fourSquareMatrix(1));
      var output = equation.run();
      output.weights.forEach(function(value) {
        assert.equal(value, 2);
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
});