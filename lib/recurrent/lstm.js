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
   * @param {Number} inputRowIndex
   * @param prev
   * @returns {{hidden: Array, cell: Array, output}}
   */
  getEquation: function(input, modelHiddenLayer, size) {
    // forward prop for a single tick of LSTM
    // model contains LSTM parameters
    // x is 1D column vector with observation
    // prev is a struct containing hidden and cell
    // from previous iteration

    var model = this.model;
    var inputRow = this.rowPluck(model.input, inputRowIndex, this);
    var hiddenSizes = this.hiddenSizes;
    var hiddenPrevs;
    var cellPrevs;
    var d;

    var hidden = [];
    var cell = [];
    for(d = 0; d < hiddenSizes.length; d++) {

      var inputVector = d === 0 ? inputRow : hidden[d - 1];
      var hiddenMatrix = model.hiddenMatrices[d];

      var inputGate = sigmoid(
        add(
          add(
            multiply(
              modelHiddenLayer.inputMatrix,
              inputVector
            ),
            multiply(
              modelHiddenLayer.inputHidden,
              new Matrix(size, 1)
            )
          ),
          modelHiddenLayer.inputBias
        )
      );

      var forgetGate = sigmoid(
        add(
          add(
            multiply(
              modelHiddenLayer.forgetMatrix,
              inputVector
            ),
            multiply(
              modelHiddenLayer.forgetHidden,
              new Matrix(size, 1)
            )
          ),
          modelHiddenLayer.forgetBias
        )
      );

      // output gate
      var outputGate = sigmoid(
        add(
          add(
            multiply(
              modelHiddenLayer.outputMatrix,
              inputVector
            ),
            multiply(
              modelHiddenLayer.outputHidden,
              new Matrix(size, 1)
            )
          ),
          modelHiddenLayer.outputBias
        )
      );

      // write operation on cells
      var cellWrite = tanh(
        add(
          add(
            multiply(
              modelHiddenLayer.cellActivationMatrix,
              inputVector
            ),
            multiply(
              modelHiddenLayer.cellActivationHidden,
              new Matrix(size, 1)
            )
          ),
          modelHiddenLayer.cellActivationBias
        )
      );

      // compute new cell activation
      var retainCell = multiplyElement(forgetGate, new Matrix(size, 1)); // what do we keep from cell
      var writeCell = multiplyElement(inputGate, cellWrite); // what do we write to cell
      var cellD = add(retainCell, writeCell); // new cell contents

      // compute hidden state as gated, saturated cell activations
      var hiddenD = multiplyElement(outputGate, tanh(cellD));

      hidden.push(hiddenD);
      cell.push(cellD);
    }

    // one decoder to outputs at end
    var output = this.add(this.multiply(model.outputConnector, hidden[hidden.length - 1], this), model.output, this);

    // return cell memory, hidden representation and output
    return {
      hidden: hidden,
      cell: cell,
      output: output
    };
  }
});

module.exports = LSTM;