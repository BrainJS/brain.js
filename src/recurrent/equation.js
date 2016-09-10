import Matrix from './matrix';
import OnesMatrix from './matrix/ones-matrix';
import _copy from './matrix/copy';
import _cloneNegative from './matrix/clone-negative';
import _add from './matrix/add';
import _addB from './matrix/add-b';
import _allOnes from './matrix/all-ones';
import _multiply from './matrix/multiply';
import _multiplyB from './matrix/multiply-b';
import _multiplyElement from './matrix/multiply-element';
import _multiplyElementB from './matrix/multiply-element-b';
import _relu from './matrix/relu';
import _reluB from './matrix/relu-b';
import _rowPluck from './matrix/row-pluck';
import _rowPluckB from './matrix/row-pluck-b';
import _sigmoid from './matrix/sigmoid';
import _sigmoidB from './matrix/sigmoid-b';
import _tanh from './matrix/tanh';
import _tanhB from './matrix/tanh-b';

export default class Equation {
  constructor() {
    this.inputRow = 0;
    this.states = [];
    this.previousResults = [];
    this.previousResultInputs = [];
  }

  /**
   *
   * @param {Number} size
   * @returns {Matrix}
   */
  previousResult(size) {
    let into = new Matrix(size, 1);
    this.previousResultInputs.push(into);
    return into;
  }

  /**
   * connects two matrices together by add
   * @param {Matrix} left
   * @param {Matrix} right
   * @returns {Matrix}
   */
  add(left, right) {
    if (left.weights.length !== right.weights.length) {
      throw new Error('misaligned matrices');
    }
    let into = new Matrix(left.rows, left.columns);
    this.states.push({
      left: left,
      right: right,
      into: into,
      forwardFn: _add,
      backpropagationFn: _addB
    });
    return into;
  }

  allOnes(rows, columns) {
    let into = new Matrix(rows, columns);
    this.states.push({
      left: into,
      into: into,
      forwardFn: _allOnes
    });
    return into;
  }

  /**
   *
   * @param {Matrix} m
   */
  cloneNegative(m) {
    let into = new Matrix(m.rows, m.columns);
    this.states.push({
      left: m,
      into: into,
      forwardFn: _cloneNegative
    });
    return into;
  }

  /**
   * connects two matrices together by subtract
   * @param {Matrix} left
   * @param {Matrix} right
   * @returns {Matrix}
   */
  subtract(left, right) {
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
  multiply(left, right) {
    if (left.columns !== right.rows) {
      throw new Error('misaligned matrices');
    }
    let into = new Matrix(left.rows, right.columns);
    this.states.push({
      left: left,
      right: right,
      into: into,
      forwardFn: _multiply,
      backpropagationFn: _multiplyB
    });
    return into;
  }

  /**
   * connects two matrices together by multiplyElement
   * @param {Matrix} left
   * @param {Matrix} right
   * @returns {Matrix}
   */
  multiplyElement(left, right) {
    if (left.weights.length !== right.weights.length) {
      throw new Error('misaligned matrices');
    }
    let into = new Matrix(left.rows, left.columns);
    this.states.push({
      left: left,
      right: right,
      into: into,
      forwardFn: _multiplyElement,
      backpropagationFn: _multiplyElementB
    });
    return into;
  }

  /**
   * connects a matrix to relu
   * @param {Matrix} m
   * @returns {Matrix}
   */
  relu(m) {
    let into = new Matrix(m.rows, m.columns);
    this.states.push({
      left: m,
      into: into,
      forwardFn: _relu,
      backpropagationFn: _reluB
    });
    return into;
  }

  /**
   * connects a matrix via a row
   * @param {Matrix} m
   * @returns {Matrix}
   */
  inputMatrixToRow(m) {
    let self = this;
    let into = new Matrix(m.columns, 1);
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
  }

  /**
   * connects a matrix to sigmoid
   * @param {Matrix} m
   * @returns {Matrix}
   */
  sigmoid(m) {
    let into = new Matrix(m.rows, m.columns);
    this.states.push({
      left: m,
      into: into,
      forwardFn: _sigmoid,
      backpropagationFn: _sigmoidB
    });
    return into;
  }

  /**
   * connects a matrix to tanh
   * @param {Matrix} m
   * @returns {Matrix}
   */
  tanh(m) {
    let into = new Matrix(m.rows, m.columns);
    this.states.push({
      left: m,
      into: into,
      forwardFn: _tanh,
      backpropagationFn: _tanhB
    });
    return into;
  }

  observe(m) {
    let iForward = 0;
    let iBackpropagate = 0;
    this.states.push({
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
  }

  /**
   *
   * @output {Matrix}
   */
  run(rowIndex) {
    this.inputRow = rowIndex || 0;

    let state;
    for (let i = 0, max = this.states.length; i < max; i++) {
      state = this.states[i];
      if (!state.hasOwnProperty('forwardFn')) {
        continue;
      }
      state.forwardFn(state.into, state.left, state.right);
    }

    return state.into;
  }

  /**
   * @output {Matrix}
   */
  runBackpropagate() {
    let i = this.states.length;
    while (i-- > 0) {
      let state = this.states[i];
      if (!state.hasOwnProperty('backpropagationFn')) {
        continue;
      }
      state.backpropagationFn(state.into, state.left, state.right);
    }
  }

  updatePreviousResults() {
    for (let i = 0, max = this.previousResults.length; i < max; i++) {
      _copy(this.previousResultInputs[i], this.previousResults[i]);
    }
  }

  copyPreviousResultsTo(equation) {
    for (let i = 0, max = this.previousResults.length; i < max; i++) {
      _copy(equation.previousResultInputs[i], this.previousResults[i]);
    }
  }

  resetPreviousResults() {
    for (let i = 0, max = this.previousResults.length; i < max; i++) {
      let prev = this.previousResultInputs[i];
      _copy(prev, new Matrix(prev.rows, 1));
    }
  }

  addPreviousResult(m) {
    this.previousResults.push(m);
  }

  toFunction() {
    throw new Error('not yet implemented');
    /*var lookupTable = [model.input, model.hiddenLayers, model.outputConnector, model.output];
    var hiddenLayers = this.model.hiddenLayers;
    for (var i = 0, max = hiddenLayers.length; i < max; i++) {
      var hiddenLayer = hiddenLayers[i];
      for (var p in hiddenLayer) {
        lookupTable.push(hiddenLayer[p]);
      }
    }

    var fowardFunctionList = [];
    for (var i = 0, max = this.states.length; i++) {
      var state = this.states[i];
      if (!state.forwardFn) continue;
      if (fowardFunctionList.indexOf(state.forwardFn) > -1) continue;
      fowardFunctionList.push(state.forwardFn);
    }

    var connectorMatrices = [];
    for (var i = 0, max = this.states.length; i++) {
      var state = this.states[i];
      if (!state.into) continue;
      if (connectorMatrices.indexOf(state.into) > -1) continue;
      connectorMatrices.push(state.into);
    }

    return new Function('rowIndex', '\
  inputRow = rowIndex || 0;\
\
      for (var i = 0, max = this.states.length; i < max; i++) {\
      var state = this.states[i];\
      if (!state.hasOwnProperty(\'forwardFn\')) {\
        continue;\
      }\
      state.forwardFn(state.into, state.left, state.right);\
    }\
\
    return state.into;\
');*/
  }

  toFunctionStates() {

  }
}
