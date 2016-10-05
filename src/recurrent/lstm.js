import Matrix from '../matrix';
import RNN from './rnn';
import RandomMatrix from '../matrix/random-matrix';

export default class LSTM extends RNN {
  getModel(hiddenSize, prevSize) {
    return {
      // gates parameters
      //wix
      inputMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08),
      //wih
      inputHidden: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      //bi
      inputBias: new Matrix(hiddenSize, 1),

      //wfx
      forgetMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08),
      //wfh
      forgetHidden: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      //bf
      forgetBias: new Matrix(hiddenSize, 1),

      //wox
      outputMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08),
      //woh
      outputHidden: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      //bo
      outputBias: new Matrix(hiddenSize, 1),

      // cell write params
      //wcx
      cellActivationMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08),
      //wch
      cellActivationHidden: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      //bc
      cellActivationBias: new Matrix(hiddenSize, 1)
    };
  }

  /**
   *
   * @param {Equation} equation
   * @param {Matrix} inputMatrix
   * @param {Number} size
   * @param {Object} hiddenLayer
   * @returns {Matrix}
   */
  getEquation(equation, inputMatrix, size, hiddenLayer) {
    let sigmoid = equation.sigmoid.bind(equation);
    let add = equation.add.bind(equation);
    let multiply = equation.multiply.bind(equation);
    let multiplyElement = equation.multiplyElement.bind(equation);
    let previousResult = equation.previousResult.bind(equation);
    let tanh = equation.tanh.bind(equation);
    let result = equation.result.bind(equation);

    let inputGate = result(
      sigmoid(
        add(
          add(
            multiply(
              hiddenLayer.inputMatrix,
              inputMatrix
            ),
            multiply(
              hiddenLayer.inputHidden,
              previousResult(size)
            )
          ),
          hiddenLayer.inputBias
        )
      )
    );

    let forgetGate = result(
      sigmoid(
        add(
          add(
            multiply(
              hiddenLayer.forgetMatrix,
              inputMatrix
            ),
            multiply(
              hiddenLayer.forgetHidden,
              previousResult(size)
            )
          ),
          hiddenLayer.forgetBias
        )
      )
    );

    // output gate
    let outputGate = result(
      sigmoid(
        add(
          add(
            multiply(
              hiddenLayer.outputMatrix,
              inputMatrix
            ),
            multiply(
              hiddenLayer.outputHidden,
              previousResult(size)
            )
          ),
          hiddenLayer.outputBias
        )
      )
    );

    // write operation on cells
    let cellWrite = result(
      tanh(
        add(
          add(
            multiply(
              hiddenLayer.cellActivationMatrix,
              inputMatrix
            ),
            multiply(
              hiddenLayer.cellActivationHidden,
              previousResult(size)
            )
          ),
          hiddenLayer.cellActivationBias
        )
      )
    );

    // compute new cell activation
    let retainCell = multiplyElement(forgetGate, previousResult(size)); // what do we keep from cell
    let writeCell = multiplyElement(inputGate, cellWrite); // what do we write to cell
    let cell = add(retainCell, writeCell); // new cell contents

    // compute hidden state as gated, saturated cell activations
    return result(multiplyElement(outputGate, tanh(cell)));
  }
}
