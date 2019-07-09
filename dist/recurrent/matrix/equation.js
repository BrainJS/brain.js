'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Matrix = require('.');
var _cloneNegative = require('./clone-negative');
var _add = require('./add');
var addB = require('./add-b');
var _allOnes = require('./all-ones');
var _multiply = require('./multiply');
var multiplyB = require('./multiply-b');
var _multiplyElement = require('./multiply-element');
var multiplyElementB = require('./multiply-element-b');
var _relu = require('./relu');
var reluB = require('./relu-b');
var rowPluck = require('./row-pluck');
var rowPluckB = require('./row-pluck-b');
var _sigmoid = require('./sigmoid');
var sigmoidB = require('./sigmoid-b');
var _tanh = require('./tanh');
var tanhB = require('./tanh-b');

var Equation = function () {
  function Equation() {
    _classCallCheck(this, Equation);

    this.inputRow = 0;
    this.inputValue = null;
    this.states = [];
  }

  /**
   * connects two matrices together by add
   * @param {Matrix} left
   * @param {Matrix} right
   * @returns {Matrix}
   */


  _createClass(Equation, [{
    key: 'add',
    value: function add(left, right) {
      if (left.weights.length !== right.weights.length) {
        throw new Error('misaligned matrices');
      }
      var product = new Matrix(left.rows, left.columns);
      this.states.push({
        left: left,
        right: right,
        product: product,
        forwardFn: _add,
        backpropagationFn: addB
      });
      return product;
    }

    /**
     *
     * @param {Number} rows
     * @param {Number} columns
     * @returns {Matrix}
     */

  }, {
    key: 'allOnes',
    value: function allOnes(rows, columns) {
      var product = new Matrix(rows, columns);
      this.states.push({
        left: product,
        product: product,
        forwardFn: _allOnes
      });
      return product;
    }

    /**
     *
     * @param {Matrix} m
     * @returns {Matrix}
     */

  }, {
    key: 'cloneNegative',
    value: function cloneNegative(m) {
      var product = new Matrix(m.rows, m.columns);
      this.states.push({
        left: m,
        product: product,
        forwardFn: _cloneNegative
      });
      return product;
    }

    /**
     * connects two matrices together by subtract
     * @param {Matrix} left
     * @param {Matrix} right
     * @returns {Matrix}
     */

  }, {
    key: 'subtract',
    value: function subtract(left, right) {
      if (left.weights.length !== right.weights.length) {
        throw new Error('misaligned matrices');
      }
      return this.add(this.add(this.allOnes(left.rows, left.columns), this.cloneNegative(left)), right);
    }

    /**
     * connects two matrices together by multiply
     * @param {Matrix} left
     * @param {Matrix} right
     * @returns {Matrix}
     */

  }, {
    key: 'multiply',
    value: function multiply(left, right) {
      if (left.columns !== right.rows) {
        throw new Error('misaligned matrices');
      }
      var product = new Matrix(left.rows, right.columns);
      this.states.push({
        left: left,
        right: right,
        product: product,
        forwardFn: _multiply,
        backpropagationFn: multiplyB
      });
      return product;
    }

    /**
     * connects two matrices together by multiplyElement
     * @param {Matrix} left
     * @param {Matrix} right
     * @returns {Matrix}
     */

  }, {
    key: 'multiplyElement',
    value: function multiplyElement(left, right) {
      if (left.weights.length !== right.weights.length) {
        throw new Error('misaligned matrices');
      }
      var product = new Matrix(left.rows, left.columns);
      this.states.push({
        left: left,
        right: right,
        product: product,
        forwardFn: _multiplyElement,
        backpropagationFn: multiplyElementB
      });
      return product;
    }

    /**
     * connects a matrix to relu
     * @param {Matrix} m
     * @returns {Matrix}
     */

  }, {
    key: 'relu',
    value: function relu(m) {
      var product = new Matrix(m.rows, m.columns);
      this.states.push({
        left: m,
        product: product,
        forwardFn: _relu,
        backpropagationFn: reluB
      });
      return product;
    }

    /**
     * copy a matrix
     * @param {Matrix} input
     * @returns {Matrix}
     */

  }, {
    key: 'input',
    value: function input(_input) {
      var self = this;
      this.states.push({
        product: _input,
        forwardFn: function forwardFn() {
          _input.weights = self.inputValue;
        }
      });
      return _input;
    }

    /**
     * connects a matrix via a row
     * @param {Matrix} m
     * @returns {Matrix}
     */

  }, {
    key: 'inputMatrixToRow',
    value: function inputMatrixToRow(m) {
      var self = this;
      var product = new Matrix(m.columns, 1);
      this.states.push({
        left: m,
        get right() {
          return self.inputRow;
        },
        product: product,
        forwardFn: rowPluck,
        backpropagationFn: rowPluckB
      });
      return product;
    }

    /**
     * connects a matrix to sigmoid
     * @param {Matrix} m
     * @returns {Matrix}
     */

  }, {
    key: 'sigmoid',
    value: function sigmoid(m) {
      var product = new Matrix(m.rows, m.columns);
      this.states.push({
        left: m,
        product: product,
        forwardFn: _sigmoid,
        backpropagationFn: sigmoidB
      });
      return product;
    }

    /**
     * connects a matrix to tanh
     * @param {Matrix} m
     * @returns {Matrix}
     */

  }, {
    key: 'tanh',
    value: function tanh(m) {
      var product = new Matrix(m.rows, m.columns);
      this.states.push({
        left: m,
        product: product,
        forwardFn: _tanh,
        backpropagationFn: tanhB
      });
      return product;
    }

    /**
     *
     * @param m
     * @returns {Matrix}
     */

  }, {
    key: 'observe',
    value: function observe(m) {
      var iForward = 0;
      var iBackpropagate = 0;
      this.states.push({
        forwardFn: function forwardFn() {
          iForward++;
        },
        backpropagationFn: function backpropagationFn() {
          iBackpropagate++;
        }
      });
      return m;
    }

    /**
     * @patam {Number} [rowIndex]
     * @output {Matrix}
     */

  }, {
    key: 'run',
    value: function run() {
      var rowIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      this.inputRow = rowIndex;
      var state = void 0;
      for (var i = 0, max = this.states.length; i < max; i++) {
        state = this.states[i];
        if (!state.hasOwnProperty('forwardFn')) {
          continue;
        }
        state.forwardFn(state.product, state.left, state.right);
      }

      return state.product;
    }

    /**
     * @patam {Number} [rowIndex]
     * @output {Matrix}
     */

  }, {
    key: 'runInput',
    value: function runInput(inputValue) {
      this.inputValue = inputValue;
      var state = void 0;
      for (var i = 0, max = this.states.length; i < max; i++) {
        state = this.states[i];
        if (!state.hasOwnProperty('forwardFn')) {
          continue;
        }
        state.forwardFn(state.product, state.left, state.right);
      }

      return state.product;
    }

    /**
     * @patam {Number} [rowIndex]
     * @output {Matrix}
     */

  }, {
    key: 'runBackpropagate',
    value: function runBackpropagate() {
      var rowIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      this.inputRow = rowIndex;

      var i = this.states.length;
      var state = void 0;
      while (i-- > 0) {
        state = this.states[i];
        if (!state.hasOwnProperty('backpropagationFn')) {
          continue;
        }
        state.backpropagationFn(state.product, state.left, state.right);
      }

      return state.product;
    }
  }]);

  return Equation;
}();

module.exports = Equation;