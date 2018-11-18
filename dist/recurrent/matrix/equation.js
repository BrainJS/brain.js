'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ = require('./');

var _2 = _interopRequireDefault(_);

var _onesMatrix = require('./ones-matrix');

var _onesMatrix2 = _interopRequireDefault(_onesMatrix);

var _copy = require('./copy');

var _copy2 = _interopRequireDefault(_copy);

var _cloneNegative2 = require('./clone-negative');

var _cloneNegative3 = _interopRequireDefault(_cloneNegative2);

var _add2 = require('./add');

var _add3 = _interopRequireDefault(_add2);

var _addB = require('./add-b');

var _addB2 = _interopRequireDefault(_addB);

var _allOnes2 = require('./all-ones');

var _allOnes3 = _interopRequireDefault(_allOnes2);

var _multiply2 = require('./multiply');

var _multiply3 = _interopRequireDefault(_multiply2);

var _multiplyB = require('./multiply-b');

var _multiplyB2 = _interopRequireDefault(_multiplyB);

var _multiplyElement2 = require('./multiply-element');

var _multiplyElement3 = _interopRequireDefault(_multiplyElement2);

var _multiplyElementB = require('./multiply-element-b');

var _multiplyElementB2 = _interopRequireDefault(_multiplyElementB);

var _relu2 = require('./relu');

var _relu3 = _interopRequireDefault(_relu2);

var _reluB = require('./relu-b');

var _reluB2 = _interopRequireDefault(_reluB);

var _rowPluck = require('./row-pluck');

var _rowPluck2 = _interopRequireDefault(_rowPluck);

var _rowPluckB = require('./row-pluck-b');

var _rowPluckB2 = _interopRequireDefault(_rowPluckB);

var _sigmoid2 = require('./sigmoid');

var _sigmoid3 = _interopRequireDefault(_sigmoid2);

var _sigmoidB = require('./sigmoid-b');

var _sigmoidB2 = _interopRequireDefault(_sigmoidB);

var _tanh2 = require('./tanh');

var _tanh3 = _interopRequireDefault(_tanh2);

var _tanhB = require('./tanh-b');

var _tanhB2 = _interopRequireDefault(_tanhB);

var _softmax = require('./softmax');

var _softmax2 = _interopRequireDefault(_softmax);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
      var product = new _2.default(left.rows, left.columns);
      this.states.push({
        left: left,
        right: right,
        product: product,
        forwardFn: _add3.default,
        backpropagationFn: _addB2.default
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
      var product = new _2.default(rows, columns);
      this.states.push({
        left: product,
        product: product,
        forwardFn: _allOnes3.default
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
      var product = new _2.default(m.rows, m.columns);
      this.states.push({
        left: m,
        product: product,
        forwardFn: _cloneNegative3.default
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
      var product = new _2.default(left.rows, right.columns);
      this.states.push({
        left: left,
        right: right,
        product: product,
        forwardFn: _multiply3.default,
        backpropagationFn: _multiplyB2.default
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
      var product = new _2.default(left.rows, left.columns);
      this.states.push({
        left: left,
        right: right,
        product: product,
        forwardFn: _multiplyElement3.default,
        backpropagationFn: _multiplyElementB2.default
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
      var product = new _2.default(m.rows, m.columns);
      this.states.push({
        left: m,
        product: product,
        forwardFn: _relu3.default,
        backpropagationFn: _reluB2.default
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
      var _this = this;

      this.states.push({
        product: _input,
        forwardFn: function forwardFn(product) {
          product.weights = _input.weights = _this.inputValue;
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
      var product = new _2.default(m.columns, 1);
      this.states.push({
        left: m,
        get right() {
          return self.inputRow;
        },
        product: product,
        forwardFn: _rowPluck2.default,
        backpropagationFn: _rowPluckB2.default
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
      var product = new _2.default(m.rows, m.columns);
      this.states.push({
        left: m,
        product: product,
        forwardFn: _sigmoid3.default,
        backpropagationFn: _sigmoidB2.default
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
      var product = new _2.default(m.rows, m.columns);
      this.states.push({
        left: m,
        product: product,
        forwardFn: _tanh3.default,
        backpropagationFn: _tanhB2.default
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
    key: 'runIndex',
    value: function runIndex() {
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
    key: 'backpropagate',
    value: function backpropagate() {
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

    /**
     * @patam {Number} [rowIndex]
     * @output {Matrix}
     */

  }, {
    key: 'backpropagateIndex',
    value: function backpropagateIndex() {
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
  }, {
    key: 'predictTarget',
    value: function predictTarget(input, target) {
      var output = this.runInput(input);
      var errorSum = 0;
      for (var i = 0; i < output.weights.length; i++) {
        var error = output.weights[i] - target[i];
        // set gradients into log probabilities
        errorSum += Math.abs(error);
        // write gradients into log probabilities
        output.deltas[i] = error;
      }
      return errorSum;
    }
  }, {
    key: 'predictTargetIndex',
    value: function predictTargetIndex(input, target) {
      var output = this.runIndex(input);
      // set gradients into log probabilities
      var logProbabilities = output; // interpret output as log probabilities
      var probabilities = (0, _softmax2.default)(output); // compute the softmax probabilities

      // write gradients into log probabilities
      logProbabilities.deltas = probabilities.weights.slice(0);
      logProbabilities.deltas[target] -= 1;

      // accumulate base 2 log prob and do smoothing
      return -Math.log2(probabilities.weights[target]);
    }
  }]);

  return Equation;
}();

exports.default = Equation;
//# sourceMappingURL=equation.js.map