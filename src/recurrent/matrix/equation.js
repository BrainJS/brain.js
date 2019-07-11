const Matrix = require('.');
const cloneNegative = require('./clone-negative');
const add = require('./add');
const addB = require('./add-b');
const allOnes = require('./all-ones');
const multiply = require('./multiply');
const multiplyB = require('./multiply-b');
const multiplyElement = require('./multiply-element');
const multiplyElementB = require('./multiply-element-b');
const relu = require('./relu');
const reluB = require('./relu-b');
const rowPluck = require('./row-pluck');
const rowPluckB = require('./row-pluck-b');
const sigmoid = require('./sigmoid');
const sigmoidB = require('./sigmoid-b');
const tanh = require('./tanh');
const tanhB = require('./tanh-b');

class Equation {
  constructor() {
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
  add(left, right) {
    if (left.weights.length !== right.weights.length) {
      throw new Error('misaligned matrices');
    }
    const product = new Matrix(left.rows, left.columns);
    this.states.push({
      left,
      right,
      product,
      forwardFn: add,
      backpropagationFn: addB,
    });
    return product;
  }

  /**
   *
   * @param {Number} rows
   * @param {Number} columns
   * @returns {Matrix}
   */
  allOnes(rows, columns) {
    const product = new Matrix(rows, columns);
    this.states.push({
      left: product,
      product,
      forwardFn: allOnes,
    });
    return product;
  }

  /**
   *
   * @param {Matrix} m
   * @returns {Matrix}
   */
  cloneNegative(m) {
    const product = new Matrix(m.rows, m.columns);
    this.states.push({
      left: m,
      product,
      forwardFn: cloneNegative,
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
    return this.add(
      this.add(this.allOnes(left.rows, left.columns), this.cloneNegative(left)),
      right
    );
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
    const product = new Matrix(left.rows, right.columns);
    this.states.push({
      left,
      right,
      product,
      forwardFn: multiply,
      backpropagationFn: multiplyB,
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
    const product = new Matrix(left.rows, left.columns);
    this.states.push({
      left,
      right,
      product,
      forwardFn: multiplyElement,
      backpropagationFn: multiplyElementB,
    });
    return product;
  }

  /**
   * connects a matrix to relu
   * @param {Matrix} m
   * @returns {Matrix}
   */
  relu(m) {
    const product = new Matrix(m.rows, m.columns);
    this.states.push({
      left: m,
      product,
      forwardFn: relu,
      backpropagationFn: reluB,
    });
    return product;
  }

  /**
   * copy a matrix
   * @param {Matrix} input
   * @returns {Matrix}
   */
  input(input) {
    const self = this;
    this.states.push({
      product: input,
      forwardFn: () => {
        input.weights = self.inputValue;
      },
    });
    return input;
  }

  /**
   * connects a matrix via a row
   * @param {Matrix} m
   * @returns {Matrix}
   */
  inputMatrixToRow(m) {
    const self = this;
    const product = new Matrix(m.columns, 1);
    this.states.push({
      left: m,
      get right() {
        return self.inputRow;
      },
      product,
      forwardFn: rowPluck,
      backpropagationFn: rowPluckB,
    });
    return product;
  }

  /**
   * connects a matrix to sigmoid
   * @param {Matrix} m
   * @returns {Matrix}
   */
  sigmoid(m) {
    const product = new Matrix(m.rows, m.columns);
    this.states.push({
      left: m,
      product,
      forwardFn: sigmoid,
      backpropagationFn: sigmoidB,
    });
    return product;
  }

  /**
   * connects a matrix to tanh
   * @param {Matrix} m
   * @returns {Matrix}
   */
  tanh(m) {
    const product = new Matrix(m.rows, m.columns);
    this.states.push({
      left: m,
      product,
      forwardFn: tanh,
      backpropagationFn: tanhB,
    });
    return product;
  }

  /**
   *
   * @param m
   * @returns {Matrix}
   */
  observe(m) {
    let iForward = 0;
    let iBackpropagate = 0;
    this.states.push({
      forwardFn() {
        iForward++;
      },
      backpropagationFn() {
        iBackpropagate++;
      },
    });
    return m;
  }

  /**
   * @patam {Number} [rowIndex]
   * @output {Matrix}
   */
  run(rowIndex = 0) {
    this.inputRow = rowIndex;
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
   * @patam {Number} [rowIndex]
   * @output {Matrix}
   */
  runInput(inputValue) {
    this.inputValue = inputValue;
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
   * @patam {Number} [rowIndex]
   * @output {Matrix}
   */
  runBackpropagate(rowIndex = 0) {
    this.inputRow = rowIndex;

    let i = this.states.length;
    let state;
    while (i-- > 0) {
      state = this.states[i];
      if (!state.hasOwnProperty('backpropagationFn')) {
        continue;
      }
      state.backpropagationFn(state.product, state.left, state.right);
    }

    return state.product;
  }
}

module.exports = Equation;
