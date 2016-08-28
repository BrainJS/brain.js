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
    var input = equation.input.bind(equation);
    var previousInput = equation.previousInput.bind(equation);
    var tanh = equation.tanh.bind(equation);

    var inputGate = sigmoid(
      add(
        add(
          multiply(
            hiddenModel.inputMatrix,
            input(inputMatrix)
          ),
          multiply(
            hiddenModel.inputHidden,
            previousInput(size)
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
            input(inputMatrix)
          ),
          multiply(
            hiddenModel.forgetHidden,
            previousInput(size)
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
            input(inputMatrix)
          ),
          multiply(
            hiddenModel.outputHidden,
            previousInput(size)
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
            input(inputMatrix)
          ),
          multiply(
            hiddenModel.cellActivationHidden,
            previousInput(size)
          )
        ),
        hiddenModel.cellActivationBias
      )
    );

    // compute new cell activation
    var retainCell = multiplyElement(forgetGate, previousInput(size)); // what do we keep from cell
    var writeCell = multiplyElement(inputGate, cellWrite); // what do we write to cell
    var cell = add(retainCell, writeCell); // new cell contents

    // compute hidden state as gated, saturated cell activations
    return multiplyElement(outputGate, tanh(cell));
  }
});

module.exports = LSTM;