import Matrix from './matrix';
import RNN from './rnn';
import RandomMatrix from './matrix/random-matrix';

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
    var sigmoid = equation.sigmoid.bind(equation);
    var add = equation.add.bind(equation);
    var multiply = equation.multiply.bind(equation);
    var multiplyElement = equation.multiplyElement.bind(equation);
    var previousResult = equation.previousResult.bind(equation);
    var tanh = equation.tanh.bind(equation);

    var inputGate = sigmoid(
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
    );

    var forgetGate = sigmoid(
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
    );

    // output gate
    var outputGate = sigmoid(
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
    );

    // write operation on cells
    var cellWrite = tanh(
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
    );

    // compute new cell activation
    var retainCell = multiplyElement(forgetGate, previousResult(size)); // what do we keep from cell
    var writeCell = multiplyElement(inputGate, cellWrite); // what do we write to cell
    var cell = add(retainCell, writeCell); // new cell contents

    // compute hidden state as gated, saturated cell activations
    return multiplyElement(outputGate, tanh(cell));
  }
}
