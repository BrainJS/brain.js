var Matrix = require('./matrix');
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

/**
 * connects two matrices together by add
 * @param {Matrix} left
 * @param {Matrix} right
 * @returns {Object}
 */
function add(left, right) {
  var states = left.states || right.states || [];
  left = left.into || left;
  right = right.into || right;
  if (left.weights.length !== right.weights.length) {
    throw new Error('misaligned matrices');
  }

  var state = {
    left: left,
    right: right,
    into: new Matrix(left.rows, left.columns),
    forwardEquation: _add,
    backpropagationEquation: _addB
  };

  states.push(state);
  state.states = states;
  return state;
}

/**
 * connects two matrices together by multiply
 * @param {Matrix} left
 * @param {Matrix} right
 * @returns {Object}
 */
function multiply(left, right) {
  var states = left.states || right.states || [];
  left = left.into || left;
  right = right.into || right;
  if (left.columns !== right.rows) {
    throw new Error('misaligned matrices');
  }

  var state = {
    left: left,
    right: right,
    into: new Matrix(left.rows, right.columns),
    forwardEquation: _multiply,
    backpropagationEquation: _multiplyB
  };

  states.push(state);
  state.states = states;
  return state;
}

/**
 * connects two matrices together by multiplyElement
 * @param {Matrix} left
 * @param {Matrix} right
 * @returns {Object}
 */
function multiplyElement(left, right) {
  var states = left.states || right.states || [];
  left = left.into || left;
  right = right.into || right;
  if (left.weights.length !== right.weights.length) {
    throw new Error('misaligned matrices');
  }

  var state = {
    left: left,
    right: right,
    into: new Matrix(left.rows, left.columns),
    forwardEquation: _multiplyElement,
    backpropagationEquation: _multiplyElementB
  };

  states.push(state);
  state.states = states;
  return state;
}

/**
 * connects a matrix to relu
 * @param {Matrix} m
 * @returns {Object}
 */
function relu(m) {
  var states = m.states || [];
  m = m.into || m;
  var state = {
    left: m,
    into: new Matrix(m.rows, m.columns),
    forwardEquation: _relu,
    backpropagationEquation: _reluB
  };

  states.push(state);
  state.states = states;
  return state;
}

/**
 * connects a matrix via a row
 * @param {Matrix} m
 * @param {Number} row
 * @returns {Object}
 */
function rowPluck(m, row) {
  //var states = m.states || [];
  m = m.into || m;
  // pluck a row of m with index ix and return it as col vector
  if (row < 0 && row >= m.rows) {
    throw new Error('row cannot pluck');
  }

  return {
    left: m,
    into: new Matrix(m.columns, 1),
    forwardEquation: _rowPluck,
    backpropagationEquation: _rowPluckB
  };

  states.push(state);
  state.states = states;
  return state;
}

/**
 * connects a matrix to sigmoid
 * @param {Matrix} m
 * @returns {Object}
 */
function sigmoid(m) {
  var states = m.states || [];
  m = m.into || m;
  var state = {
    left: m,
    into: new Matrix(m.rows, m.columns),
    forwardEquation: _sigmoid,
    backpropagationEquation: _sigmoidB
  };

  state.states = states;
  states.push(state);
  return state;
}

/**
 * connects a matrix to tanh
 * @param {Matrix} m
 * @returns {Object}
 */
function tanh(m) {
  m = m.into || m;
  var states = m.states || [];
  var state = {
    left: m,
    into: new Matrix(m.rows, m.columns),
    forwardEquation: _tanh,
    backpropagationEquation: _tanhB
  };

  state.states = states;
  states.push(state);
  return state;
}

/**
 *
 * @param {Object} equation
 * @output {Matrix}
 */
function run(equation) {
  var states = equation.states;
  for (var i = 0, max = states.length; i < max; i++) {
    var state = states[i];
    state.forwardEquation(state.into, state.left, state.right);
  }

  return states[states.length - 1].into;
}

/**
 *
 * @param {Matrix} equation
 */
function runBackpropagate(equation) {
  var states = equation.states;
  for (var i = 0, max = states.length; i < max; i++) {
    var state = states[i];
    state.backpropagationEquation(state.into, state.left, state.right);
  }

  return states[states.length - 1].into;
}

/**
 * removes backpropagationEquation from a matrix, and all leading matrices
 * @param {Matrix} m
 */
function stripBackpropagationEquations(m) {
  while (m.right !== null) {
    m.backpropagationEquation = null;
    m = m.right;
  }
}

/**
 * removes backpropagationEquation from a matrix, and all leading matrices
 * @param {Matrix} m
 */
function addBackpropagationEquations(m) {
  while (m.right !== null) {
    var fn = null;
    switch (m.forwardEquation) {
      case _add:
        fn = _addB;
        break;
      case _multiply:
        fn = _multiplyB;
        break;
      case _multiplyElement:
        fn = _multiplyElementB;
        break;
      case _relu:
        fn = _reluB;
        break;
      case _rowPluck:
        fn = _rowPluckB;
        break;
      case _sigmoid:
        fn = _sigmoidB;
        break;
      case _tanh:
        fn = _tanhB;
        break;
    }
    m.backpropagationEquation = fn;
    m = m.right;
  }
}

module.exports = {
  add: add,
  multiply: multiply,
  multiplyElement: multiplyElement,
  relu: relu,
  rowPluck: rowPluck,
  sigmoid: sigmoid,
  tanh: tanh,
  run: run,
  runBackpropagate: runBackpropagate,
  stripBackpropagationEquations: stripBackpropagationEquations,
  addBackpropagationEquations: addBackpropagationEquations
};
