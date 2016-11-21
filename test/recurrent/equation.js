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
  describe('previousResult', function() {
    it('copies weights to previous result', function () {
      var equation = new Equation();
      equation.result(
        equation.add(
          equation.add(
            new OnesMatrix(1, 2),
            equation.previousResult(2)
          ),
          new OnesMatrix(1, 2)
        )
      );

      assert.equal(equation.states.length, 3);

      //previous result
      assert.equal(equation.states[0].left.weights[0], 0);
      assert.equal(equation.states[0].left.weights[1], 0);
      assert.equal(equation.states[0].left.recurrence[0], 0);
      assert.equal(equation.states[0].left.recurrence[1], 0);
      assert.equal(equation.states[0].product.weights[0], 0);
      assert.equal(equation.states[0].product.weights[1], 0);
      assert.equal(equation.states[0].product.recurrence[0], 0);
      assert.equal(equation.states[0].product.recurrence[1], 0);

      //add
      assert.equal(equation.states[1].left.weights[0], 1);
      assert.equal(equation.states[1].left.weights[1], 1);
      assert.equal(equation.states[1].left.recurrence[0], 1);
      assert.equal(equation.states[1].left.recurrence[1], 1);
      assert.equal(equation.states[1].right.weights[0], 0);
      assert.equal(equation.states[1].right.weights[1], 0);
      assert.equal(equation.states[1].right.recurrence[0], 0);
      assert.equal(equation.states[1].right.recurrence[1], 0);
      assert.equal(equation.states[1].product.weights[0], 0);
      assert.equal(equation.states[1].product.weights[1], 0);
      assert.equal(equation.states[1].product.recurrence[0], 0);
      assert.equal(equation.states[1].product.recurrence[1], 0);

      //add
      assert.equal(equation.states[2].left.weights[0], 0);
      assert.equal(equation.states[2].left.weights[1], 0);
      assert.equal(equation.states[2].left.recurrence[0], 0);
      assert.equal(equation.states[2].left.recurrence[1], 0);
      assert.equal(equation.states[2].right.weights[0], 1);
      assert.equal(equation.states[2].right.weights[1], 1);
      assert.equal(equation.states[2].right.recurrence[0], 1);
      assert.equal(equation.states[2].right.recurrence[1], 1);
      assert.equal(equation.states[2].product.weights[0], 0);
      assert.equal(equation.states[2].product.weights[1], 0);
      assert.equal(equation.states[2].product.recurrence[0], 0);
      assert.equal(equation.states[2].product.recurrence[1], 0);

      var output = equation.run();

      //previous result
      assert.equal(equation.states[0].left.weights[0], 2); // <-- added here, which is also the output of the result, or last test
      assert.equal(equation.states[0].left.weights[1], 2);
      assert.equal(equation.states[0].left.recurrence[0], 0);
      assert.equal(equation.states[0].left.recurrence[1], 0);
      assert.equal(equation.states[0].product.weights[0], 0); // <-- not yet added to the product, waiting for backpropagate
      assert.equal(equation.states[0].product.weights[1], 0);
      assert.equal(equation.states[0].product.recurrence[0], 0);
      assert.equal(equation.states[0].product.recurrence[1], 0);

      //add
      assert.equal(equation.states[1].left.weights[0], 1); // <-- added here
      assert.equal(equation.states[1].left.weights[1], 1);
      assert.equal(equation.states[1].left.recurrence[0], 0);
      assert.equal(equation.states[1].left.recurrence[1], 0);
      assert.equal(equation.states[1].right.weights[0], 0); // <-- not yet added to the product, waiting for backpropagate
      assert.equal(equation.states[1].right.weights[1], 0);
      assert.equal(equation.states[1].right.recurrence[0], 0);
      assert.equal(equation.states[1].right.recurrence[1], 0);
      assert.equal(equation.states[1].product.weights[0], 1);  // <-- added here, 0 + 1 = 1
      assert.equal(equation.states[1].product.weights[1], 1);
      assert.equal(equation.states[1].product.recurrence[0], 0);
      assert.equal(equation.states[1].product.recurrence[1], 0);

      //add
      assert.equal(equation.states[2].left.weights[0], 1); // <-- product from last step
      assert.equal(equation.states[2].left.weights[1], 1);
      assert.equal(equation.states[2].left.recurrence[0], 0);
      assert.equal(equation.states[2].left.recurrence[1], 0);
      assert.equal(equation.states[2].right.weights[0], 1); // <-- Ones Matrix
      assert.equal(equation.states[2].right.weights[1], 1);
      assert.equal(equation.states[2].right.recurrence[0], 0);
      assert.equal(equation.states[2].right.recurrence[1], 0);
      assert.equal(equation.states[2].product.weights[0], 2); // <-- 1 + 1 = 2
      assert.equal(equation.states[2].product.weights[1], 2);
      assert.equal(equation.states[2].product.recurrence[0], 0);
      assert.equal(equation.states[2].product.recurrence[1], 0);

      output.recurrence = output.weights.slice(0);
      equation.runBackpropagate();

      assert.equal(equation.states[2].product.weights[0], 2);
      assert.equal(equation.states[2].product.weights[1], 2);
      assert.equal(equation.states[2].product.recurrence[0], 2); // <-- value is from recurrence
      assert.equal(equation.states[2].product.recurrence[1], 2);
      assert.equal(equation.states[2].left.weights[0], 1); // <-- unchanged
      assert.equal(equation.states[2].left.weights[1], 1);
      assert.equal(equation.states[2].left.recurrence[0], 2); // <-- 0 += 2 = 2
      assert.equal(equation.states[2].left.recurrence[1], 2);
      assert.equal(equation.states[2].right.weights[0], 1);
      assert.equal(equation.states[2].right.weights[1], 1);
      assert.equal(equation.states[2].right.recurrence[0], 2);  // <-- 0 += 2 = 2
      assert.equal(equation.states[2].right.recurrence[1], 2);

      assert.equal(equation.states[1].product.weights[0], 1); // <-- unchanged
      assert.equal(equation.states[1].product.weights[1], 1);
      assert.equal(equation.states[1].product.recurrence[0], 2); // value from left or right of step 2
      assert.equal(equation.states[1].product.recurrence[1], 2);
      assert.equal(equation.states[1].left.weights[0], 1); // <-- unchanged
      assert.equal(equation.states[1].left.weights[1], 1);
      assert.equal(equation.states[1].left.recurrence[0], 2); // <-- 0 += 2 = 2
      assert.equal(equation.states[1].left.recurrence[1], 2);
      assert.equal(equation.states[1].right.weights[0], 2); // <-- double booya! backpropagate ran!
      assert.equal(equation.states[1].right.weights[1], 2);
      assert.equal(equation.states[1].right.recurrence[0], 2); // <-- 0 += 2 = 2
      assert.equal(equation.states[1].right.recurrence[1], 2);

      assert.equal(equation.states[0].product.weights[0], 2); // <-- booya! backpropagate ran!
      assert.equal(equation.states[0].product.weights[1], 2);
      assert.equal(equation.states[0].product.recurrence[0], 2); // value from left or right of step 1
      assert.equal(equation.states[0].product.recurrence[1], 2);
      assert.equal(equation.states[0].left.weights[0], 2); // <-- unchanged
      assert.equal(equation.states[0].left.weights[1], 2);
      assert.equal(equation.states[0].left.recurrence[0], 2); // <-- 0 += 2 = 2
      assert.equal(equation.states[0].left.recurrence[1], 2);
    });
  });
});