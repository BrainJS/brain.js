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
  this.states = []
  this.states.previousResults = [];
  this.states.previousResultInputs = [];
  this.depthStates = {};
  this.depth = 0;
}

Equation.prototype = {
  /**
   *
   * @param {Number} size
   * @returns {Matrix}
   */
  previousResult: function (size) {
    var into = new Matrix(size, 1);
    this.states.previousResultInputs.push(into);
    this.states.push({
      called: this.previousResult.bind(this),
      arguments: arguments
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
      called: this.add.bind(this),
      arguments: arguments,
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
      called: this.multiply.bind(this),
      arguments: arguments,
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
      called: this.multiplyElement.bind(this),
      arguments: arguments,
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
      called: this.relu.bind(this),
      arguments: arguments,
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
      called: this.inputMatrixToRow.bind(this),
      arguments: arguments,
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
      called: this.sigmoid.bind(this),
      arguments: arguments,
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
      called: this.tanh.bind(this),
      arguments: arguments,
      left: m,
      into: into,
      forwardFn: _tanh,
      backpropagationFn: _tanhB
    });
    return into;
  },

  observe: function(m) {
    var iForward = 0;
    var iBackpropagate = 0;
    this.states.push({
      called: this.observe.bind(this),
      arguments: arguments,
      forwardFn: function() {
        iForward++;
        console.log(m);
      },
      backpropagationFn: function() {
        iBackpropagate++;
        console.log(m);
      }
    });
    return m;
  },

  prepareDepth: function() {
    if (!0 in this.depthStates) {
      this.depthStates[0] = this.states;
    }

    if (this.depth > 0) {
      var previousStates = this.states;
      var depthStates;
      if (!(this.depth in this.depthStates)) {
        depthStates = this.depthStates[this.depth] = [];
        depthStates.previousResults = [];
        depthStates.previousResultInputs = [];
        this.states = depthStates;
        for (var i = 0, max = previousStates.length; i < max; i++) {
          var previousState = previousStates[i];
          previousState.called.apply(this, previousState.arguments);
        }
      }
      this.states = this.depthStates[this.depth];
    }
  },

  /**
   *
   * @output {Matrix}
   */
  run: function (rowIndex) {
    this.inputRow = rowIndex || 0;

    if (this.depth > 0) {
      this.prepareDepth();
    }

    for (var i = 0, max = this.states.length; i < max; i++) {
      var state = this.states[i];
      if (!state.hasOwnProperty('forwardFn')) {
        continue;
      }
      state.forwardFn(state.into, state.left, state.right);
    }

    this.depth++;
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

    if (this.depth > 0) {
      this.depth--;
    }
    if (this.depth > 0) {
      this.prepareDepth();
      this.runBackpropagate();
    }
  },

  updatePreviousResults: function() {
    for (var i = 0, max = this.states.previousResults.length; i < max; i++) {
      _copy(this.states.previousResultInputs[i], this.states.previousResults[i]);
    }
  },

  resetPreviousResults: function() {
    for (var i = 0, max = this.states.previousResults.length; i < max; i++) {
      var prev = this.states.previousResultInputs[i];
      _copy(prev, new Matrix(prev.rows, 1));
    }
  },

  addPreviousResult: function(m) {
    this.states.previousResults.push(m);
  }
};

module.exports = Equation;
