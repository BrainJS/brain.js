var Matrix = require('./matrix'),
  RandomMatrix = require('./matrix/random'),
  add = require('./matrix/add'),
  multiply = require('./matrix/multiply'),
  multiplyElement = require('./matrix/multiply-element');

function LSTM(inputSize, hiddenSizes, outputSize) {
  // hidden size should be a list

  this.model = [];
  this.inputSize = inputSize;
  this.hiddenSizes = hiddenSizes;
  this.outputSize = outputSize;

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
}

LSTM.prototype = {
  /**
   *
   * @param {Graph} graph
   * @param prev
   * @returns {{hidden: Array, cell: Array, output}}
   */
  forward: function (graph, prev) {
    // forward prop for a single tick of LSTM
    // G is graph to append ops to
    // model contains LSTM parameters
    // x is 1D column vector with observation
    // prev is a struct containing hidden and cell
    // from previous iteration

    var model = this.model,
      hiddenSizes = this.hiddenSizes,
      hiddenPrevs,
      cellPrevs,
      d;

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
      var h0 = multiply(model[d].wix, inputVector);
      var h1 = multiply(model[d].wih, hiddenPrev);
      var inputGate = graph.sigmoid(add(add(h0,h1),model[d].bi));

      // forget gate
      var h2 = multiply(model[d].wfx, inputVector);
      var h3 = multiply(model[d].wfh, hiddenPrev);
      var forgetGate = graph.sigmoid(add(add(h2, h3),model[d].bf));

      // output gate
      var h4 = multiply(model[d].wox, inputVector);
      var h5 = multiply(model[d].woh, hiddenPrev);
      var outputGate = graph.sigmoid(add(add(h4, h5),model[d].bo));

      // write operation on cells
      var h6 = multiply(model[d].wcx, inputVector);
      var h7 = multiply(model[d].wch, hiddenPrev);
      var cellWrite = graph.tanh(add(add(h6, h7),model[d].bc));

      // compute new cell activation
      var retainCell = multiplyElement(forgetGate, cellPrev); // what do we keep from cell
      var writeCell = multiplyElement(inputGate, cellWrite); // what do we write to cell
      var cellD = add(retainCell, writeCell); // new cell contents

      // compute hidden state as gated, saturated cell activations
      var hiddenD = multiplyElement(outputGate, graph.tanh(cellD));

      hidden.push(hiddenD);
      cell.push(cellD);
    }

    // one decoder to outputs at end
    var output = add(multiply(model.whd, hidden[hidden.length - 1]), model.bd);

    // return cell memory, hidden representation and output
    return {
      hidden: hidden,
      cell: cell,
      output: output
    };
  }
};
