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
    let product = new Matrix(size, 1);
    this.previousResultInputs.push(product);
    return product;
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
    let product = new Matrix(left.rows, left.columns);
    this.states.push({
      left: left,
      right: right,
      product: product,
      forwardFn: _add,
      backpropagationFn: _addB
    });
    return product;
  }

  allOnes(rows, columns) {
    let product = new Matrix(rows, columns);
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
   */
  cloneNegative(m) {
    let product = new Matrix(m.rows, m.columns);
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
    let product = new Matrix(left.rows, right.columns);
    this.states.push({
      left: left,
      right: right,
      product: product,
      forwardFn: _multiply,
      backpropagationFn: _multiplyB
    });
    return product;
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
    let product = new Matrix(left.rows, left.columns);
    this.states.push({
      left: left,
      right: right,
      product: product,
      forwardFn: _multiplyElement,
      backpropagationFn: _multiplyElementB
    });
    return product;
  }

  /**
   * connects a matrix to relu
   * @param {Matrix} m
   * @returns {Matrix}
   */
  relu(m) {
    let product = new Matrix(m.rows, m.columns);
    this.states.push({
      left: m,
      product: product,
      forwardFn: _relu,
      backpropagationFn: _reluB
    });
    return product;
  }

  /**
   * connects a matrix via a row
   * @param {Matrix} m
   * @returns {Matrix}
   */
  inputMatrixToRow(m) {
    let self = this;
    let product = new Matrix(m.columns, 1);
    this.states.push({
      left: m,
      get right () {
        return self.inputRow;
      },
      product: product,
      forwardFn: _rowPluck,
      backpropagationFn: _rowPluckB
    });
    return product;
  }

  /**
   * connects a matrix to sigmoid
   * @param {Matrix} m
   * @returns {Matrix}
   */
  sigmoid(m) {
    let product = new Matrix(m.rows, m.columns);
    this.states.push({
      left: m,
      product: product,
      forwardFn: _sigmoid,
      backpropagationFn: _sigmoidB
    });
    return product;
  }

  /**
   * connects a matrix to tanh
   * @param {Matrix} m
   * @returns {Matrix}
   */
  tanh(m) {
    let product = new Matrix(m.rows, m.columns);
    this.states.push({
      left: m,
      product: product,
      forwardFn: _tanh,
      backpropagationFn: _tanhB
    });
    return product;
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
      state.forwardFn(state.product, state.left, state.right);
    }

    return state.product;
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
      state.backpropagationFn(state.product, state.left, state.right);
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
}
