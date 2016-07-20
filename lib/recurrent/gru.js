var Matrix = require('./matrix');
var RNN = require('./rnn');
var RandomMatrix = require('./matrix/random');

function GRU(options) {
  //call super
  RNN.call(this, options);
}

GRU.prototype = Object.create(RNN.prototype, {
  fillModel: function() {
    var hiddenSizes = this.hiddenSizes;
    for(var d=0;d<hiddenSizes.length;d++) { // loop over depths
      var prevSize = d === 0 ? inputSize : hiddenSizes[d - 1];
      var hiddenSize = hiddenSizes[d];

      this.model.push({
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
      });
    }

    // decoder params
    this.model.whd = new RandomMatrix(outputSize, hiddenSize, 0, 0.08);
    this.model.bd = new Matrix(outputSize, 1);

    return this;
  },

  forward: function (previousNodes, sourceVector) {
    var model = this.model;
    var hiddenSizes = this.hiddenSizes;
    var previousHiddenNodes = [];
    var depth;

    if (typeof previousNodes.hidden === 'undefined') {
      for (depth = 0; depth < hiddenSizes.length; depth++) {
        previousHiddenNodes.push(new Matrix(hiddenSizes[depth], 1));
      }
    } else {
      previousHiddenNodes = previousNodes.hidden;
    }

    var hiddenResults = [],
      inputVector,
      previousHiddenNode,
      hidden0,
      hidden1,
      resetGate,
      hidden2,
      hidden3,
      updateGate,
      hidden4,
      hidden5,
      cell,
      hiddenAtDepth,
      allOnes,
      negUpdateGate;
    for (depth = 0; depth < hiddenSizes.length; depth++) {
      inputVector = (depth === 0 ? sourceVector : hiddenResults[depth - 1]);
      previousHiddenNode = previousHiddenNodes[depth];

      // reset gate
      hidden0 = this.multiply(model[depth].wrxh, inputVector, this);
      hidden1 = this.multiply(model[depth].wrhh, previousHiddenNode, this);
      resetGate = this.sigmoid(this.add(this.add(hidden0, hidden1, this), model[depth].br, this), this);

      // update gate
      hidden2 = this.multiply(model[depth].wzxh, inputVector, this);
      hidden3 = this.multiply(model[depth].wzhh, previousHiddenNode, this);
      updateGate = this.sigmoid(this.add(this.add(hidden2, hidden3, this), model[depth].bz, this), this);

      // cell
      hidden4 = this.multiply(model[depth].wcxh, inputVector, this);
      hidden5 = this.multiply(model[depth].wchh, this.multiplyElement(resetGate, previousHiddenNode, this), this);
      cell = this.tanh(this.add(this.add(hidden4, hidden5), model[depth].bc, this), this);

      // compute hidden state as gated, saturated cell activations
      allOnes = createMatrixFilledWithOnes(updateGate.rows, updateGate.columns, this);
      // negate updateGate
      negUpdateGate = createNegatedCloneMatrix(updateGate);
      hiddenAtDepth = this.add(this.multiplyElement(this.add(allOnes, negUpdateGate, this), cell, this), this.multiplyElement(previousHiddenNode, updateGate, this), this);

      hiddenResults.push(hiddenAtDepth);
    }

    // decode results of last hidden unit to output
    var output = this.add(this.multiply(model.whd, hiddenResults[hiddenResults.length - 1], this), model.bd, this);

    // return hidden representation and output
    return {
      output: output,
      hidden: hiddenResults
    };
  }
});

module.exports = GRU;