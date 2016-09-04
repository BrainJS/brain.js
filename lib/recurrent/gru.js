var Matrix = require('./matrix');
var RNN = require('./rnn');
var RandomMatrix = require('./matrix/random');

function GRU(options) {
  //call super
  RNN.call(this, options);
}

GRU.prototype = Object.assign({}, RNN.prototype, {
  getModel: function(hiddenSize, prevSize) {
    return {
      // reset Gate
      wrxh: new RandomMatrix(hiddenSize, prevSize, 0.08),
      wrhh: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      br: new Matrix(hiddenSize, 1),

      // update Gate
      wzxh: new RandomMatrix(hiddenSize, prevSize, 0.08),
      wzhh: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      bz: new Matrix(hiddenSize, 1),

      // cell write parameters
      wcxh: new RandomMatrix(hiddenSize, prevSize, 0.08),
      wchh: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      bc: new Matrix(hiddenSize, 1)
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
            hiddenModel.wrxh,
            inputMatrix
          ),
          multiply(
            hiddenModel.wrhh,
            previousResult(size)
          )
        ),
        hiddenModel.br
      )
    );

    // update gate
    var updateGate = sigmoid(
      add(
        add(
          multiply(
            hiddenModel.wzxh,
            input
          ),
          multiply(
            hiddenModel.wzhh,
            previousResult(size)
          )
        ),
        hiddenModel.bz
      )
    );

    // cell
    var cell = tanh(
      add(
        add(
          multiply(
            hiddenModel.wcxh,
            inputVector
          ),
          multiply(
            hiddenModel.wchh,
            multiplyElement(
              resetGate,
              previousResult(size)
            )
          )
        ),
        hiddenModel.bc
      )
    );

    // compute hidden state as gated, saturated cell activations
    var allOnes = createMatrixFilledWithOnes(updateGate.rows, updateGate.columns);
    // negate updateGate
    var negUpdateGate = createNegatedCloneMatrix(updateGate);
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