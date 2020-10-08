import { Matrix } from './matrix';
import { Equation } from './matrix/equation';
import { RandomMatrix } from './matrix/random-matrix';
import RNN from './rnn';

export interface LSTMModel {
  inputMatrix: Matrix;
  inputHidden: Matrix;
  inputBias: Matrix;
  forgetMatrix: Matrix;
  forgetHidden: Matrix;
  forgetBias: Matrix;
  outputMatrix: Matrix;
  outputHidden: Matrix;
  outputBias: Matrix;
  cellActivationMatrix: Matrix;
  cellActivationHidden: Matrix;
  cellActivationBias: Matrix;
}

export class LSTM extends RNN {
  static getModel(hiddenSize: number, prevSize: number): LSTMModel {
    return {
      // gates parameters
      // wix
      inputMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08), // wih
      inputHidden: new RandomMatrix(hiddenSize, hiddenSize, 0.08), // bi
      inputBias: new Matrix(hiddenSize, 1),
      // wfx
      forgetMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08), // wfh
      forgetHidden: new RandomMatrix(hiddenSize, hiddenSize, 0.08), // bf
      forgetBias: new Matrix(hiddenSize, 1),
      // wox
      outputMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08), // woh
      outputHidden: new RandomMatrix(hiddenSize, hiddenSize, 0.08), // bo
      outputBias: new Matrix(hiddenSize, 1),
      // cell write params
      // wcx
      cellActivationMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08), // wch
      cellActivationHidden: new RandomMatrix(hiddenSize, hiddenSize, 0.08), // bc
      cellActivationBias: new Matrix(hiddenSize, 1),
    };
  }

  static getEquation(
    equation: Equation,
    inputMatrix: Matrix,
    previousResult: Matrix,
    hiddenLayer: LSTMModel
  ): Matrix {
    const sigmoid = equation.sigmoid.bind(equation);
    const add = equation.add.bind(equation);
    const multiply = equation.multiply.bind(equation);
    const multiplyElement = equation.multiplyElement.bind(equation);
    const tanh = equation.tanh.bind(equation);

    const inputGate = sigmoid(
      add(
        add(
          multiply(hiddenLayer.inputMatrix, inputMatrix),
          multiply(hiddenLayer.inputHidden, previousResult)
        ),
        hiddenLayer.inputBias
      )
    );

    const forgetGate = sigmoid(
      add(
        add(
          multiply(hiddenLayer.forgetMatrix, inputMatrix),
          multiply(hiddenLayer.forgetHidden, previousResult)
        ),
        hiddenLayer.forgetBias
      )
    );

    // output gate
    const outputGate = sigmoid(
      add(
        add(
          multiply(hiddenLayer.outputMatrix, inputMatrix),
          multiply(hiddenLayer.outputHidden, previousResult)
        ),
        hiddenLayer.outputBias
      )
    );

    // write operation on cells
    const cellWrite = tanh(
      add(
        add(
          multiply(hiddenLayer.cellActivationMatrix, inputMatrix),
          multiply(hiddenLayer.cellActivationHidden, previousResult)
        ),
        hiddenLayer.cellActivationBias
      )
    );

    // compute new cell activation
    const retainCell = multiplyElement(forgetGate, previousResult); // what do we keep from cell
    const writeCell = multiplyElement(inputGate, cellWrite); // what do we write to cell
    const cell = add(retainCell, writeCell); // new cell contents

    // compute hidden state as gated, saturated cell activations
    return multiplyElement(outputGate, tanh(cell));
  }
}
