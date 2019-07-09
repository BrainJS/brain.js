const Matrix = require('./matrix');
const RandomMatrix = require('./matrix/random-matrix');
const RNN = require('./rnn');

class GRU extends RNN {
  static getModel(hiddenSize, prevSize) {
    return {
      // update Gate
      // wzxh
      updateGateInputMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08), // wzhh
      updateGateHiddenMatrix: new RandomMatrix(hiddenSize, hiddenSize, 0.08), // bz
      updateGateBias: new Matrix(hiddenSize, 1),
      // reset Gate
      // wrxh
      resetGateInputMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08), // wrhh
      resetGateHiddenMatrix: new RandomMatrix(hiddenSize, hiddenSize, 0.08), // br
      resetGateBias: new Matrix(hiddenSize, 1),
      // cell write parameters
      // wcxh
      cellWriteInputMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08), // wchh
      cellWriteHiddenMatrix: new RandomMatrix(hiddenSize, hiddenSize, 0.08), // bc
      cellWriteBias: new Matrix(hiddenSize, 1),
    };
  }

  /**
   *
   * @param {Equation} equation
   * @param {Matrix} inputMatrix
   * @param {Matrix} previousResult
   * @param {Object} hiddenLayer
   * @returns {Matrix}
   */
  static getEquation(equation, inputMatrix, previousResult, hiddenLayer) {
    const sigmoid = equation.sigmoid.bind(equation);
    const add = equation.add.bind(equation);
    const multiply = equation.multiply.bind(equation);
    const multiplyElement = equation.multiplyElement.bind(equation);
    const tanh = equation.tanh.bind(equation);
    const allOnes = equation.allOnes.bind(equation);
    const cloneNegative = equation.cloneNegative.bind(equation);

    // update gate
    const updateGate = sigmoid(
      add(
        add(
          multiply(hiddenLayer.updateGateInputMatrix, inputMatrix),
          multiply(hiddenLayer.updateGateHiddenMatrix, previousResult)
        ),
        hiddenLayer.updateGateBias
      )
    );

    // reset gate
    const resetGate = sigmoid(
      add(
        add(
          multiply(hiddenLayer.resetGateInputMatrix, inputMatrix),
          multiply(hiddenLayer.resetGateHiddenMatrix, previousResult)
        ),
        hiddenLayer.resetGateBias
      )
    );

    // cell
    const cell = tanh(
      add(
        add(
          multiply(hiddenLayer.cellWriteInputMatrix, inputMatrix),
          multiply(
            hiddenLayer.cellWriteHiddenMatrix,
            multiplyElement(resetGate, previousResult)
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
      multiplyElement(previousResult, updateGate)
    );
  }
}

module.exports = GRU;
