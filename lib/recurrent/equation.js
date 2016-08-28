var Matrix = require('./matrix');
var _copy = require('./matrix/copy');
var _add = require('./matrix/add');
var _addB = require('./matrix/add-b');
var _multiply = require('./matrix/multiply');
var _multiplyB = require('./matrix/multiply-b');
var _multiplyElement = require('./matrix/multiply-element');
var _multiplyElementB = require('./matrix/multiply-element-b');
var _relu = require('./matrix/relu');
var _reluB = require('./matrix/relu-b');
var _rowPluck = require('./matrix/row-pluck');
var _rowPluckB = require('./matrix/row-pluck-b');
var _sigmoid = require('./matrix/sigmoid');
var _sigmoidB = require('./matrix/sigmoid-b');
var _tanh = require('./matrix/tanh');
var _tanhB = require('./matrix/tanh-b');

function Equation() {
  this.inputRow = 0;
  this.states = [];
  this.inputs = [];
}

Equation.prototype = {

  /**
   *
   * @param {Matrix} m
   * @returns {Matrix}
   */
  input: function (m) {
    this.inputs.push(m);
    return m;
  },

  /**
   *
   * @param {Number} size
   * @returns {Matrix}
   */
  previousInput: function (size) {
    var input = this.inputs[this.inputs.length - 1];
    if (input.rows !== size) throw new Error('size must match input.rows');

    var into = new Matrix(size, 1);
    this.states.push({
      into: into,
      left: input,
      backpropagationFn: _copy
    });

    return into;
  },

  /**
   * connects two matrices together by add
   * @param {Matrix} left
   * @param {Matrix} right
   * @returns {Matrix}
   */
  add: function (left, right) {
    if (left.weights.length !== right.weights.length) {
      throw new Error('misaligned matrices');
    }
    var into = new Matrix(left.rows, left.columns);
    this.states.push({
      left: left,
      right: right,
      into: into,
      forwardFn: _add,
      backpropagationFn: _addB
    });
    return into;
  },

  /**
   * connects two matrices together by multiply
   * @param {Matrix} left
   * @param {Matrix} right
   * @returns {Matrix}
   */
  multiply: function (left, right) {
    if (left.columns !== right.rows) {
      throw new Error('misaligned matrices');
    }
    var into = new Matrix(left.rows, right.columns);
    this.states.push({
      left: left,
      right: right,
      into: into,
      forwardFn: _multiply,
      backpropagationFn: _multiplyB
    });
    return into;
  },

  /**
   * connects two matrices together by multiplyElement
   * @param {Matrix} left
   * @param {Matrix} right
   * @returns {Matrix}
   */
  multiplyElement: function (left, right) {
    if (left.weights.length !== right.weights.length) {
      throw new Error('misaligned matrices');
    }
    var into = new Matrix(left.rows, left.columns);
    this.states.push({
      left: left,
      right: right,
      into: into,
      forwardFn: _multiplyElement,
      backpropagationFn: _multiplyElementB
    });
    return into;
  },

  /**
   * connects a matrix to relu
   * @param {Matrix} m
   * @returns {Matrix}
   */
  relu: function (m) {
    var into = new Matrix(m.rows, m.columns);
    this.states.push({
      left: m,
      into: into,
      forwardFn: _relu,
      backpropagationFn: _reluB
    });
    return into;
  },

  /**
   * connects a matrix via a row
   * @param {Matrix} m
   * @returns {Matrix}
   */
  inputMatrixToRow: function (m) {
    var self = this;
    var into = new Matrix(m.columns, 1);
    this.states.push({
      left: m,
      get right () {
        return self.inputRow;
      },
      into: into,
      forwardFn: _rowPluck,
      backpropagationFn: _rowPluckB
    });
    return into;
  },

  /**
   * connects a matrix to sigmoid
   * @param {Matrix} m
   * @returns {Matrix}
   */
  sigmoid: function (m) {
    var into = new Matrix(m.rows, m.columns);
    this.states.push({
      left: m,
      into: into,
      forwardFn: _sigmoid,
      backpropagationFn: _sigmoidB
    });
    return into;
  },

  /**
   * connects a matrix to tanh
   * @param {Matrix} m
   * @returns {Matrix}
   */
  tanh: function (m) {
    var into = new Matrix(m.rows, m.columns);
    this.states.push({
      left: m,
      into: into,
      forwardFn: _tanh,
      backpropagationFn: _tanhB
    });
    return into;
  },

  /**
   *
   * @output {Matrix}
   */
  run: function (rowIndex) {
    this.inputRow = rowIndex || 0;

    for (var i = 0, max = this.states.length; i < max; i++) {
      var state = this.states[i];
      if (!state.hasOwnProperty('forwardFn')) {
        continue;
      }
      state.forwardFn(state.into, state.left, state.right);
    }

    return state.into;
  },

  /**
   * @output {Matrix}
   */
  runBackpropagate: function () {
    var i = this.states.length;
    while (i-- > 0) {
      var state = this.states[i];
      if (!state.hasOwnProperty('backpropagationFn')) {
        continue;
      }
      state.backpropagationFn(state.into, state.left, state.right);
    }
  }
};

module.exports = Equation;
