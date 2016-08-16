var fs = require('fs');
var assert = require('assert');
var Matrix = require('../../../lib/recurrent/matrix');
var equationBuilder = require('../../../lib/recurrent/equation-builder');
var add = equationBuilder.add;
var multiply = equationBuilder.multiply;
var run = equationBuilder.run;

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

describe('equation-builder', function() {
  describe('add', function() {
    it('can add two matrices with values of one', function() {
      var input = fourSquareMatrix(1);
      var equation = add(input, fourSquareMatrix(1));
      var output = run(equation);
      output.weights.forEach(function(value) {
        assert.equal(value, 2);
      });
    });
  });
  describe('add', function() {
    it('can add two matrices nested 3 times, all matrices start with values of one', function() {
      var input = fourSquareMatrix(1);
      var equation = add(add(add(input, fourSquareMatrix(1)), fourSquareMatrix(1)), fourSquareMatrix(1));
      var output = run(equation);
      output.weights.forEach(function(value) {
        assert.equal(value, 4);
      });
    });
  });
  describe('multiply', function() {
    it('can multiply two matrices all values of two', function() {
      var input = fourSquareMatrix(2);
      var equation = multiply(input, fourSquareMatrix(2));
      var output = run(equation);
      output.weights.forEach(function(value) {
        assert.equal(value, 16);
      });
    });
    it('can multiply two matrices nested 3 times, all matrices start with values of two', function() {
      var input = fourSquareMatrix(2);
      var equation = multiply(multiply(multiply(input, fourSquareMatrix(2)), fourSquareMatrix(2)), fourSquareMatrix(2));
      var output = run(equation);
      output.weights.forEach(function(value) {
        assert.equal(value, 1024);
      });
    });
  });
});