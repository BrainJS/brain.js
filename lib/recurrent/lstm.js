var Matrix = require('./matrix');
var RNN = require('./rnn');
var RandomMatrix = require('./matrix/random');

function LSTM(options) {
  //call super
  RNN.call(this, options);
}

LSTM.prototype = Object.create(RNN.prototype, {
  fillModel: function() {
    var hiddenSizes = this.hiddenSizes;
    for(var d=0;d<hiddenSizes.length;d++) { // loop over depths
      var prevSize = d === 0 ? inputSize : hiddenSizes[d - 1];
      var hiddenSize = hiddenSizes[d];
      this.model.push({
        // gates parameters
        wix: new RandomMatrix(hiddenSize, prevSize , 0, 0.08),
        wih: new RandomMatrix(hiddenSize, hiddenSize , 0, 0.08),
        bi: new Matrix(hiddenSize, 1),

        wfx: new RandomMatrix(hiddenSize, prevSize , 0, 0.08),
        wfh: new RandomMatrix(hiddenSize, hiddenSize , 0, 0.08),
        bf: new Matrix(hiddenSize, 1),

        wox: new RandomMatrix(hiddenSize, prevSize , 0, 0.08),
        woh: new RandomMatrix(hiddenSize, hiddenSize , 0, 0.08),
        bo: new Matrix(hiddenSize, 1),

        // cell write params
        wcx: new RandomMatrix(hiddenSize, prevSize , 0, 0.08),
        wch: new RandomMatrix(hiddenSize, hiddenSize , 0, 0.08),
        bc: new Matrix(hiddenSize, 1)
      });
    }

    // decoder params
    this.model.whd = new RandomMatrix(outputSize, hiddenSize, 0, 0.08);
    this.model.bd = new Matrix(outputSize, 1);

    return this;
  },
  /**
   *
   * @param prev
   * @returns {{hidden: Array, cell: Array, output}}
   */
  forward: function (x, prev) {
    // forward prop for a single tick of LSTM
    // model contains LSTM parameters
    // x is 1D column vector with observation
    // prev is a struct containing hidden and cell
    // from previous iteration

    var model = this.model;
    var hiddenSizes = this.hiddenSizes;
    var hiddenPrevs;
    var cellPrevs;
    var d;

    if(typeof prev.hidden === 'undefined') {
      hiddenPrevs = [];
      cellPrevs = [];
      for(d=0;d<hiddenSizes.length;d++) {
        hiddenPrevs.push(new Matrix(hiddenSizes[d],1));
        cellPrevs.push(new Matrix(hiddenSizes[d],1));
      }
    } else {
      hiddenPrevs = prev.hidden;
      cellPrevs = prev.cell;
    }

    var hidden = [],
      cell = [];
    for(d=0;d<hiddenSizes.length;d++) {

      var inputVector = d === 0 ? x : hidden[d-1];
      var hiddenPrev = hiddenPrevs[d];
      var cellPrev = cellPrevs[d];

      // input gate
      var h0 = this.multiply(model[d].wix, inputVector, this);
      var h1 = this.multiply(model[d].wih, hiddenPrev, this);
      var inputGate = this.sigmoid(this.add(this.add(h0, h1, this), model[d].bi, this), this);

      // forget gate
      var h2 = this.multiply(model[d].wfx, inputVector, this);
      var h3 = this.multiply(model[d].wfh, hiddenPrev, this);
      var forgetGate = this.sigmoid(this.add(this.add(h2, h3, this), model[d].bf, this), this);

      // output gate
      var h4 = this.multiply(model[d].wox, inputVector, this);
      var h5 = this.multiply(model[d].woh, hiddenPrev, this);
      var outputGate = this.sigmoid(this.add(this.add(h4, h5, this), model[d].bo, this), this);

      // write operation on cells
      var h6 = this.multiply(model[d].wcx, inputVector, this);
      var h7 = this.multiply(model[d].wch, hiddenPrev, this);
      var cellWrite = this.tanh(this.add(this.add(h6, h7, this), model[d].bc, this), this);

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
    var output = this.add(this.multiply(model.whd, hidden[hidden.length - 1], this), model.bd, this);

    // return cell memory, hidden representation and output
    return {
      hidden: hidden,
      cell: cell,
      output: output
    };
  }
});

module.exports = LSTM;