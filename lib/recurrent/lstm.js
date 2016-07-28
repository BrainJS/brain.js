var Matrix = require('./matrix');
var RNN = require('./rnn');
var RandomMatrix = require('./matrix/random');

function LSTM(options) {
  //call super
  RNN.call(this, options);
}

LSTM.prototype = Object.assign({}, RNN.prototype, {
  fillModel: function() {
    var hiddenSizes = this.hiddenSizes;
    var inputSize = this.inputSize;
    var outputSize = this.outputSize;
    var model = this.model;
    var hiddenMatrices = model.hiddenMatrices;
    var allMatrices = model.allMatrices;

    //wil
    model.input = new RandomMatrix(inputSize, hiddenSizes[0], 0, 0.08);
    allMatrices.push(model.input);

    for(var d = 0; d < hiddenSizes.length; d++) { // loop over depths
      var prevSize = d === 0 ? hiddenSizes[0] : hiddenSizes[d - 1];
      var hiddenSize = hiddenSizes[d];
      //wix
      var inputMatrix = new RandomMatrix(hiddenSize, prevSize , 0, 0.08);
        //wih
      var inputHidden = new RandomMatrix(hiddenSize, hiddenSize , 0, 0.08);
        //bi
      var inputBias = new Matrix(hiddenSize, 1);

        //wfx
      var forgetMatrix = new RandomMatrix(hiddenSize, prevSize , 0, 0.08);
        //wfh
      var forgetHidden = new RandomMatrix(hiddenSize, hiddenSize , 0, 0.08);
        //bf
      var forgetBias = new Matrix(hiddenSize, 1);

        //wox
      var outputMatrix = new RandomMatrix(hiddenSize, prevSize , 0, 0.08);
        //woh
      var outputHidden = new RandomMatrix(hiddenSize, hiddenSize , 0, 0.08);
        //bo
      var outputBias = new Matrix(hiddenSize, 1);

        // cell write params
        //wcx
      var cellActivationMatrix = new RandomMatrix(hiddenSize, prevSize , 0, 0.08);
        //wch
      var cellActivationHidden = new RandomMatrix(hiddenSize, hiddenSize , 0, 0.08);
        //bc
      var cellActivationBias = new Matrix(hiddenSize, 1);

      hiddenMatrices.push({
        // gates parameters
        inputMatrix: inputMatrix,
        inputHidden: inputHidden,
        inputBias: inputBias,

        forgetMatrix: forgetMatrix,
        forgetHidden: forgetHidden,
        forgetBias: forgetBias,

        outputMatrix: outputMatrix,
        outputHidden: outputHidden,
        outputBias: outputBias,

        cellActivationMatrix: cellActivationMatrix,
        cellActivationHidden: cellActivationHidden,
        cellActivationBias: cellActivationBias
      });

      allMatrices.push(
        inputMatrix,
        inputHidden,
        inputBias,

        forgetMatrix,
        forgetHidden,
        forgetBias,

        outputMatrix,
        outputHidden,
        outputBias,

        cellActivationMatrix,
        cellActivationHidden,
        cellActivationBias
      );
    }

    // decoder params
    //whd
    model.outputConnector = new RandomMatrix(outputSize, hiddenSize, 0, 0.08);
    allMatrices.push(model.outputConnector);
    //bd
    model.output = new Matrix(outputSize, 1);
    allMatrices.push(model.output);

    return this;
  },
  /**
   * @param {Number} inputRowIndex
   * @param prev
   * @returns {{hidden: Array, cell: Array, output}}
   */
  forward: function (inputRowIndex, prev) {
    // forward prop for a single tick of LSTM
    // model contains LSTM parameters
    // x is 1D column vector with observation
    // prev is a struct containing hidden and cell
    // from previous iteration

    var inputRow = this.rowPluck(this.model.input, inputRowIndex, this);
    var model = this.model;
    var hiddenSizes = this.hiddenSizes;
    var hiddenPrevs;
    var cellPrevs;
    var d;

    if(typeof prev.hidden === 'undefined') {
      hiddenPrevs = [];
      cellPrevs = [];
      for(d = 0; d < hiddenSizes.length; d++) {
        hiddenPrevs.push(new Matrix(hiddenSizes[d], 1));
        cellPrevs.push(new Matrix(hiddenSizes[d], 1));
      }
    } else {
      hiddenPrevs = prev.hidden;
      cellPrevs = prev.cell;
    }

    var hidden = [];
    var cell = [];
    for(d = 0; d < hiddenSizes.length; d++) {

      var inputVector = d === 0 ? inputRow : hidden[d - 1];
      var hiddenPrev = hiddenPrevs[d];
      var cellPrev = cellPrevs[d];
      var hiddenMatrix = model.hiddenMatrices[d];

      // input gate
      var h0 = this.multiply(hiddenMatrix.inputMatrix, inputVector, this);
      var h1 = this.multiply(hiddenMatrix.inputHidden, hiddenPrev, this);
      var inputGate = this.sigmoid(this.add(this.add(h0, h1, this), hiddenMatrix.inputBias, this), this);

      // forget gate
      var h2 = this.multiply(hiddenMatrix.forgetMatrix, inputVector, this);
      var h3 = this.multiply(hiddenMatrix.forgetHidden, hiddenPrev, this);
      var forgetGate = this.sigmoid(this.add(this.add(h2, h3, this), hiddenMatrix.forgetBias, this), this);

      // output gate
      var h4 = this.multiply(hiddenMatrix.outputMatrix, inputVector, this);
      var h5 = this.multiply(hiddenMatrix.outputHidden, hiddenPrev, this);
      var outputGate = this.sigmoid(this.add(this.add(h4, h5, this), hiddenMatrix.outputBias, this), this);

      // write operation on cells
      var h6 = this.multiply(hiddenMatrix.cellActivationMatrix, inputVector, this);
      var h7 = this.multiply(hiddenMatrix.cellActivationHidden, hiddenPrev, this);
      var cellWrite = this.tanh(this.add(this.add(h6, h7, this), hiddenMatrix.cellActivationBias, this), this);

      // compute new cell activation
      var retainCell = this.multiplyElement(forgetGate, cellPrev, this); // what do we keep from cell
      var writeCell = this.multiplyElement(inputGate, cellWrite, this); // what do we write to cell
      var cellD = this.add(retainCell, writeCell, this); // new cell contents

      // compute hidden state as gated, saturated cell activations
      var hiddenD = this.multiplyElement(outputGate, this.tanh(cellD, this), this);

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