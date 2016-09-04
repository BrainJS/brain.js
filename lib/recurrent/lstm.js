var Matrix = require('./matrix');
var RNN = require('./rnn');
var RandomMatrix = require('./matrix/random');

function LSTM(options) {
  //call super
  RNN.call(this, options);
}

LSTM.prototype = Object.assign({}, RNN.prototype, {
  getModel: function(hiddenSize, prevSize) {
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

    var inputGate = sigmoid(
      add(
        add(
          multiply(
            hiddenModel.inputMatrix,
            inputMatrix
          ),
          multiply(
            hiddenModel.inputHidden,
            previousResult(size)
          )
        ),
        hiddenModel.inputBias
      )
    );

    var forgetGate = sigmoid(
      add(
        add(
          multiply(
            hiddenModel.forgetMatrix,
            inputMatrix
          ),
          multiply(
            hiddenModel.forgetHidden,
            previousResult(size)
          )
        ),
        hiddenModel.forgetBias
      )
    );

    // output gate
    var outputGate = sigmoid(
      add(
        add(
          multiply(
            hiddenModel.outputMatrix,
            inputMatrix
          ),
          multiply(
            hiddenModel.outputHidden,
            previousResult(size)
          )
        ),
        hiddenModel.outputBias
      )
    );

    // write operation on cells
    var cellWrite = tanh(
      add(
        add(
          multiply(
            hiddenModel.cellActivationMatrix,
            inputMatrix
          ),
          multiply(
            hiddenModel.cellActivationHidden,
            previousResult(size)
          )
        ),
        hiddenModel.cellActivationBias
      )
    );

    // compute new cell activation
    var retainCell = multiplyElement(forgetGate, previousResult(size)); // what do we keep from cell
    var writeCell = multiplyElement(inputGate, cellWrite); // what do we write to cell
    var cell = add(retainCell, writeCell); // new cell contents

    // compute hidden state as gated, saturated cell activations
    return multiplyElement(outputGate, tanh(cell));
  }
});

module.exports = LSTM;