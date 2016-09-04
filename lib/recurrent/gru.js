var Matrix = require('./matrix');
var RNN = require('./rnn');
var RandomMatrix = require('./matrix/random-matrix');
var OnesMatrix = require('./matrix/ones-matrix');
var cloneNegative = require('./matrix/clone-negative');

function GRU(options) {
  //call super
  RNN.call(this, options);
}

GRU.prototype = Object.assign({}, RNN.prototype, {
  getModel: function(hiddenSize, prevSize) {
    return {
      // reset Gate
      //wrxh
      resetGateInputMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08),
      //wrhh
      resetGateHiddenMatrix: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      //br
      resetGateBias: new Matrix(hiddenSize, 1),

      // update Gate
      //wzxh
      updateGateInputMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08),
      //wzhh
      updateGateHiddenMatrix: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      //bz
      updateGateBias: new Matrix(hiddenSize, 1),

      // cell write parameters
      //wcxh
      cellWriteInputMatrix: new RandomMatrix(hiddenSize, prevSize, 0.08),
      //wchh
      cellWriteHiddenMatrix: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      //bc
      cellWriteBias: new Matrix(hiddenSize, 1)
    };
  },

  /**
   *
   * @param {Equation} equation
   * @param {Matrix} inputMatrix
   * @param {Number} size
   * @param {Object} hiddenModel
   * @returns {Matrix}
   */
  getEquation: function(equation, inputMatrix, size, hiddenModel) {
    var sigmoid = equation.sigmoid.bind(equation);
    var add = equation.add.bind(equation);
    var multiply = equation.multiply.bind(equation);
    var multiplyElement = equation.multiplyElement.bind(equation);
    var previousResult = equation.previousResult.bind(equation);
    var tanh = equation.tanh.bind(equation);

    // reset gate
    var resetGate = sigmoid(
      add(
        add(
          multiply(
            hiddenModel.resetGateInputMatrix,
            inputMatrix
          ),
          multiply(
            hiddenModel.resetGateHiddenMatrix,
            previousResult(size)
          )
        ),
        hiddenModel.resetGateBias
      )
    );

    // update gate
    var updateGate = sigmoid(
      add(
        add(
          multiply(
            hiddenModel.updateGateInputMatrix,
            inputMatrix
          ),
          multiply(
            hiddenModel.updateGateHiddenMatrix,
            previousResult(size)
          )
        ),
        hiddenModel.updateGateBias
      )
    );

    // cell
    var cell = tanh(
      add(
        add(
          multiply(
            hiddenModel.cellWriteInputMatrix,
            inputMatrix
          ),
          multiply(
            hiddenModel.cellWriteHiddenMatrix,
            multiplyElement(
              resetGate,
              previousResult(size)
            )
          )
        ),
        hiddenModel.cellWriteBias
      )
    );

    // compute hidden state as gated, saturated cell activations
    var allOnes = new OnesMatrix(updateGate.rows, updateGate.columns);
    // negate updateGate
    var negUpdateGate = cloneNegative(updateGate);
    return add(
      multiplyElement(
        add(
          allOnes,
          negUpdateGate
        ),
        cell
      ),
      multiplyElement(
        previousResult(size),
        updateGate
      )
    );
  }
});

module.exports = GRU;