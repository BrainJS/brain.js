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
  this.previousInputs = [];
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
    if ((this.inputs.length - 1) !== this.previousInputs.length) throw new Error('not enough inputs for previousInput');
    if (this.inputs[this.inputs.length - 1].rows !== size) throw new Error('previousInputs misaligned with inputs');

    var into = new Matrix(size, 1);
    this.previousInputs.push(into);
    return into;
  },

  copyToPreviousInput: function(m) {
    var previousInput = this.previousInputs[this.previousInputs.length - 1];
    if (this.inputs.length !== this.previousInputs.length) throw new Error('not enough inputs for previousInput');
    if (m.rows !== previousInput.rows) throw new Error('matrix rows misaligned with previousInput');
    if (m.columns !== previousInput.columns) throw new Error('matrix columns misaligned with previousInput');

    this.states.push({
      into: previousInput,
      left: m,
      forwardEquation: _copy
    });
    return m;
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
      forwardEquation: _add,
      backpropagationEquation: _addB
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
      forwardEquation: _multiply,
      backpropagationEquation: _multiplyB
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
      forwardEquation: _multiplyElement,
      backpropagationEquation: _multiplyElementB
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
      forwardEquation: _relu,
      backpropagationEquation: _reluB
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
      forwardEquation: _rowPluck,
      backpropagationEquation: _rowPluckB
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
      forwardEquation: _sigmoid,
      backpropagationEquation: _sigmoidB
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
      forwardEquation: _tanh,
      backpropagationEquation: _tanhB
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
      state.forwardEquation(state.into, state.left, state.right);
    }

    return state.into;
  },

  /**
   * @output {Matrix}
   */
  runBackpropagate: function () {
    for (var i = 0, max = this.states.length; i < max; i++) {
      var state = this.states[i];
      if (!state.hasOwnProperty('backpropagationEquation')) continue;
      state.backpropagationEquation(state.into, state.left, state.right);
    }
  }
};

module.exports = Equation;
