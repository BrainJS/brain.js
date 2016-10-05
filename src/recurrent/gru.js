import Matrix from '../matrix';
import RNN from './rnn';
import RandomMatrix from '../matrix/random-matrix';

export default class GRU extends RNN {
  getModel(hiddenSize, prevSize) {
    return {
      // update Gate
      //wzxh
      updateGateInputMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08),
      //wzhh
      updateGateHiddenMatrix: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      //bz
      updateGateBias: new Matrix(hiddenSize, 1),

      // reset Gate
      //wrxh
      resetGateInputMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08),
      //wrhh
      resetGateHiddenMatrix: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      //br
      resetGateBias: new Matrix(hiddenSize, 1),

      // cell write parameters
      //wcxh
      cellWriteInputMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08),
      //wchh
      cellWriteHiddenMatrix: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      //bc
      cellWriteBias: new Matrix(hiddenSize, 1)
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
    let allOnes = equation.allOnes.bind(equation);
    let cloneNegative = equation.cloneNegative.bind(equation);

    // update gate
    let updateGate = sigmoid(
      add(
        add(
          multiply(
            hiddenLayer.updateGateInputMatrix,
            inputMatrix
          ),
          multiply(
            hiddenLayer.updateGateHiddenMatrix,
            previousResult(size)
          )
        ),
        hiddenLayer.updateGateBias
      )
    );

    // reset gate
    let resetGate = sigmoid(
      add(
        add(
          multiply(
            hiddenLayer.resetGateInputMatrix,
            inputMatrix
          ),
          multiply(
            hiddenLayer.resetGateHiddenMatrix,
            previousResult(size)
          )
        ),
        hiddenLayer.resetGateBias
      )
    );

    // cell
    let cell = tanh(
      add(
        add(
          multiply(
            hiddenLayer.cellWriteInputMatrix,
            inputMatrix
          ),
          multiply(
            hiddenLayer.cellWriteHiddenMatrix,
            multiplyElement(
              resetGate,
              previousResult(size)
            )
          )
        ),
        hiddenLayer.cellWriteBias
      )
    );

    // compute hidden state as gated, saturated cell activations
    // negate updateGate
    return add(
      multiplyElement(
        add(
          allOnes(updateGate.rows, updateGate.columns),
          cloneNegative(updateGate)
        ),
        cell
      ),
      multiplyElement(
        previousResult(size),
        updateGate
      )
    );
  }
}
