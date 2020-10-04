import { Matrix } from '.';
import { add } from './add';
import { addB } from './add-b';
import { allOnes } from './all-ones';
import { cloneNegative } from './clone-negative';
import { multiply } from './multiply';
import { multiplyB } from './multiply-b';
import { multiplyElement } from './multiply-element';
import { multiplyElementB } from './multiply-element-b';
import { relu } from './relu';
import { reluB } from './relu-b';
import { rowPluck } from './row-pluck';
import { rowPluckB } from './row-pluck-b';
import { sigmoid } from './sigmoid';
import { sigmoidB } from './sigmoid-b';
import { softmax } from './softmax';
import { tanh } from './tanh';
import { tanhB } from './tanh-b';
// const OnesMatrix = require('./ones-matrix');
// const copy = require('./copy');

export class Equation {
  inputRow = 0;
  inputValue: Float32Array | null = null;
  states: Array<{
    product: Matrix;
    left?: Matrix;
    right?: Matrix;
    forwardFn:
      | ((product: Matrix, left: Matrix, right: Matrix) => Matrix)
      | ((product: Matrix, left: Matrix, right: Matrix) => void)
      | ((
          product: Matrix,
          left: Matrix,
          right: undefined,
          index?: number
        ) => void)
      | ((
          product: Matrix,
          left: Matrix,
          // right: undefined,
          index?: number
        ) => void)
      | (() => void);
    backpropagationFn?:
      | ((product: Matrix, left: Matrix, right: Matrix) => Matrix)
      | ((product: Matrix, left: Matrix, right: Matrix) => void)
      | ((
          product: Matrix,
          left: Matrix,
          right: undefined,
          index?: number
        ) => void)
      | ((
          product: Matrix,
          left: Matrix,
          // right: undefined,
          index?: number
        ) => void)
      | (() => void);
  }> = [];

  // constructor() {}

  /**
   * connects two matrices together by add
   * @param {Matrix} left
   * @param {Matrix} right
   * @returns {Matrix}
   */
  add(left: Matrix, right: Matrix): Matrix {
    if (left.weights.length !== right.weights.length) {
      throw new Error('misaligned matrices');
    }

    const product = new Matrix(left.rows, left.columns);

    this.states.push({
      product,
      left,
      right,
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
  allOnes(rows: number, columns: number): Matrix {
    const product = new Matrix(rows, columns);

    this.states.push({
      product,
      left: product,
      forwardFn: allOnes,
    });

    return product;
  }

  /**
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  cloneNegative(matrix: Matrix): Matrix {
    const product = new Matrix(matrix.rows, matrix.columns);

    this.states.push({
      product,
      left: matrix,
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
  subtract(left: Matrix, right: Matrix): Matrix {
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
  multiply(left: Matrix, right: Matrix): Matrix {
    if (left.columns !== right.rows) {
      throw new Error('misaligned matrices');
    }

    const product = new Matrix(left.rows, right.columns);

    this.states.push({
      product,
      left,
      right,
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
  multiplyElement(left: Matrix, right: Matrix): Matrix {
    if (left.weights.length !== right.weights.length) {
      throw new Error('misaligned matrices');
    }

    const product = new Matrix(left.rows, left.columns);

    this.states.push({
      product,
      left,
      right,
      forwardFn: multiplyElement,
      backpropagationFn: multiplyElementB,
    });

    return product;
  }

  /**
   * connects a matrix to relu
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  relu(matrix: Matrix): Matrix {
    const product = new Matrix(matrix.rows, matrix.columns);

    this.states.push({
      product,
      left: matrix,
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
  input(input: Matrix): Matrix {
    this.states.push({
      product: input,
      forwardFn: (product: Matrix) => {
        if (this.inputValue === null) return;

        product.weights = input.weights = this.inputValue;
      },
    });

    return input;
  }

  /**
   * connects a matrix via a row
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  inputMatrixToRow(matrix: Matrix): Matrix {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const product = new Matrix(matrix.columns, 1);

    this.states.push({
      product,
      left: matrix,
      get right() {
        return self.inputRow;
      },
      forwardFn: rowPluck,
      backpropagationFn: rowPluckB,
    });

    return product;
  }

  /**
   * connects a matrix to sigmoid
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  sigmoid(matrix: Matrix): Matrix {
    const product = new Matrix(matrix.rows, matrix.columns);

    this.states.push({
      product,
      left: matrix,
      forwardFn: sigmoid,
      backpropagationFn: sigmoidB,
    });

    return product;
  }

  /**
   * connects a matrix to tanh
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  tanh(matrix: Matrix): Matrix {
    const product = new Matrix(matrix.rows, matrix.columns);

    this.states.push({
      product,
      left: matrix,
      forwardFn: tanh,
      backpropagationFn: tanhB,
    });

    return product;
  }

  /**
   *
   * @param matrix
   * @returns {Matrix}
   */
  observe(matrix: Matrix): Matrix {
    this.states.push({
      product: new Matrix(),
      forwardFn: () => {},
      backpropagationFn: () => {},
    });

    return matrix;
  }

  /**
   * @patam {Number} [rowIndex]
   * @output {Matrix}
   */
  runIndex(rowIndex = 0): Matrix {
    this.inputRow = rowIndex;
    let state = this.states[0];

    for (let i = 0, max = this.states.length; i < max; i++) {
      state = this.states[i];

      if (!state.hasOwnProperty('forwardFn')) continue;
      if (!state.product) continue;
      if (!state.left) continue;
      if (!state.right) continue;

      state.forwardFn(state.product, state.left, state.right);
    }

    return state.product;
  }

  /**
   * @patam {Number} [rowIndex]
   * @output {Matrix}
   */
  runInput(inputValue: Float32Array): Matrix {
    this.inputValue = inputValue;
    let state = this.states[0];

    for (let i = 0, max = this.states.length; i < max; i++) {
      state = this.states[i];

      if (!state.hasOwnProperty('forwardFn')) continue;
      if (!state.product) continue;
      if (!state.left) continue;
      if (!state.right) continue;

      state.forwardFn(state.product, state.left, state.right);
    }

    return state.product;
  }

  /**
   * @patam {Number} [rowIndex]
   * @output {Matrix}
   */
  backpropagate(): Matrix {
    let i = this.states.length;
    let state = this.states[0];

    while (i-- > 0) {
      state = this.states[i];

      if (!state.hasOwnProperty('backpropagationFn')) continue;
      if (!state.product) continue;
      if (!state.left) continue;
      if (!state.right) continue;

      state.backpropagationFn(state.product, state.left, state.right);
    }

    return state.product;
  }

  /**
   * @patam {Number} [rowIndex]
   * @output {Matrix}
   */
  backpropagateIndex(rowIndex = 0): Matrix {
    this.inputRow = rowIndex;

    let i = this.states.length;
    let state = this.states[0];

    while (i-- > 0) {
      state = this.states[i];

      if (!state.hasOwnProperty('backpropagationFn')) continue;
      if (!state.product) continue;
      if (!state.left) continue;
      if (!state.right) continue;

      state.backpropagationFn(state.product, state.left, state.right);
    }

    return state.product;
  }

  predictTarget(input: Float32Array, target: Float32Array): number {
    let errorSum = 0;
    const output = this.runInput(input);

    for (let i = 0; i < output.weights.length; i++) {
      const error = output.weights[i] - target[i];
      // set gradients into log probabilities
      errorSum += Math.abs(error);
      // write gradients into log probabilities
      output.deltas[i] = error;
    }

    return errorSum;
  }

  predictTargetIndex(input: number, target: number): number {
    const output = this.runIndex(input);
    // set gradients into log probabilities
    const logProbabilities = output; // interpret output as log probabilities
    const probabilities = softmax(output); // compute the softmax probabilities

    // write gradients into log probabilities
    logProbabilities.deltas = probabilities.weights.slice(0);
    logProbabilities.deltas[target] -= 1;

    // accumulate base 2 log prob and do smoothing
    return -Math.log2(probabilities.weights[target]);
  }
}
