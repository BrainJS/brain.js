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

type PropagateIndex = (product: Matrix, left: Matrix, index: number) => void;
type PropagateProduct = (product: Matrix) => void;
type PropagateProductFromLeft = (product: Matrix, left: Matrix) => void;
type PropagateProductFromLeftRight = (
  product: Matrix,
  left: Matrix,
  right: Matrix
) => void;
type PropagateFunction =
  | PropagateIndex
  | PropagateProduct
  | PropagateProductFromLeft
  | PropagateProductFromLeftRight;

export interface IState {
  name: string;
  product: Matrix;
  left?: Matrix;
  right?: Matrix;
  forwardFn: PropagateFunction;
  backpropagationFn: PropagateFunction;
}

export class Equation {
  states: IState[] = [];
  inputValue?: Float32Array;
  inputRow = 0;

  add(left: Matrix, right: Matrix): Matrix {
    if (left.weights.length !== right.weights.length) {
      throw new Error('misaligned matrices');
    }

    const product = new Matrix(left.rows, left.columns);

    this.states.push({
      name: 'add',
      product,
      left,
      right,
      forwardFn: add,
      backpropagationFn: addB,
    });

    return product;
  }

  allOnes(rows: number, columns: number): Matrix {
    const product = new Matrix(rows, columns);

    this.states.push({
      name: 'allOnes',
      product,
      left: product,
      forwardFn: allOnes,
      backpropagationFn: () => {},
    });

    return product;
  }

  cloneNegative(matrix: Matrix): Matrix {
    const product = new Matrix(matrix.rows, matrix.columns);

    this.states.push({
      name: 'cloneNegative',
      product,
      left: matrix,
      forwardFn: cloneNegative,
      backpropagationFn: () => {},
    });

    return product;
  }

  /**
   * connects two matrices together by subtract
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
   */
  multiply(left: Matrix, right: Matrix): Matrix {
    if (left.columns !== right.rows) {
      throw new Error('misaligned matrices');
    }

    const product = new Matrix(left.rows, right.columns);

    this.states.push({
      name: 'multiply',
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
   */
  multiplyElement(left: Matrix, right: Matrix): Matrix {
    if (left.weights.length !== right.weights.length) {
      throw new Error('misaligned matrices');
    }

    const product = new Matrix(left.rows, left.columns);

    this.states.push({
      name: 'multiplyElement',
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
   */
  relu(matrix: Matrix): Matrix {
    const product = new Matrix(matrix.rows, matrix.columns);

    this.states.push({
      name: 'relu',
      product,
      left: matrix,
      forwardFn: relu,
      backpropagationFn: reluB,
    });

    return product;
  }

  /**
   * input a matrix
   */
  input(input: Matrix): Matrix {
    this.states.push({
      name: 'input',
      product: input,
      forwardFn: (product: Matrix) => {
        if (!this.inputValue) return;
        if (this.inputValue.length !== product.weights.length) {
          throw new Error('this.inputValue is of wrong dimensions');
        }
        product.weights = input.weights = this.inputValue;
      },
      backpropagationFn: () => {},
    });

    return input;
  }

  /**
   * connects a matrix via a row
   */
  inputMatrixToRow(matrix: Matrix): Matrix {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const product = new Matrix(matrix.columns, 1);

    this.states.push({
      name: 'inputMatrixToRow',
      product,
      left: matrix,
      get right() {
        return (self.inputRow as unknown) as Matrix;
      },
      forwardFn: rowPluck,
      backpropagationFn: rowPluckB,
    });

    return product;
  }

  /**
   * connects a matrix to sigmoid
   */
  sigmoid(matrix: Matrix): Matrix {
    const product = new Matrix(matrix.rows, matrix.columns);

    this.states.push({
      name: 'sigmoid',
      product,
      left: matrix,
      forwardFn: sigmoid,
      backpropagationFn: sigmoidB,
    });

    return product;
  }

  /**
   * connects a matrix to tanh
   */
  tanh(matrix: Matrix): Matrix {
    const product = new Matrix(matrix.rows, matrix.columns);

    this.states.push({
      name: 'tanh',
      product,
      left: matrix,
      forwardFn: tanh,
      backpropagationFn: tanhB,
    });

    return product;
  }

  /**
   *
   * Observe a matrix for debugging
   */
  observe(matrix: Matrix): Matrix {
    this.states.push({
      name: 'observe',
      product: new Matrix(),
      forwardFn: () => {},
      backpropagationFn: () => {},
    });

    return matrix;
  }

  /**
   * Run index through equations via forward propagation
   */
  runIndex(rowIndex = 0): Matrix {
    this.inputRow = rowIndex;
    let state = this.states[0];

    for (let i = 0, max = this.states.length; i < max; i++) {
      state = this.states[i];

      if (!state.hasOwnProperty('forwardFn')) continue;
      (state.forwardFn as PropagateProductFromLeftRight)(
        state.product,
        state.left as Matrix,
        state.right as Matrix
      );
    }

    return state.product;
  }

  /**
   * Run value through equations via forward propagation
   */
  runInput(inputValue: Float32Array): Matrix {
    this.inputValue = inputValue;
    let state = this.states[0];

    for (let i = 0, max = this.states.length; i < max; i++) {
      state = this.states[i];

      if (!state.hasOwnProperty('forwardFn')) continue;
      (state.forwardFn as PropagateProductFromLeftRight)(
        state.product,
        state.left as Matrix,
        state.right as Matrix
      );
    }

    return state.product;
  }

  /**
   * Run value through equations via back propagation
   */
  backpropagate(): Matrix {
    let i = this.states.length;
    let state = this.states[0];

    while (i-- > 0) {
      state = this.states[i];

      if (!state.hasOwnProperty('backpropagationFn')) continue;
      (state.backpropagationFn as PropagateProductFromLeftRight)(
        state.product,
        state.left as Matrix,
        state.right as Matrix
      );
    }

    return state.product;
  }

  /**
   * Run index through equations via back propagation
   */
  backpropagateIndex(rowIndex = 0): Matrix {
    this.inputRow = rowIndex;

    let i = this.states.length;
    let state = this.states[0];

    while (i-- > 0) {
      state = this.states[i];

      if (!state.hasOwnProperty('backpropagationFn')) continue;
      (state.backpropagationFn as PropagateProductFromLeftRight)(
        state.product,
        state.left as Matrix,
        state.right as Matrix
      );
    }

    return state.product;
  }

  /**
   * Predict a target value from equation
   */
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

  /**
   * Predict a target index from equation
   */
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
