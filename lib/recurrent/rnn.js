var Matrix = require('./matrix'),
  RandomMatrix = require('./matrix/random'),
  add = require('./matrix/add'),
  multiply = require('./matrix/multiply');

function RNN(inputSize, hiddenSizes, outputSize) {
  // hidden size should be a list
  var model = [];
  this.inputSize = inputSize;
  this.hiddenSizes = hiddenSizes;
  this.outputSize = outputSize;

  for(var d=0;d<hiddenSizes.length;d++) { // loop over depths
    var prevSize = d === 0 ? inputSize : hiddenSizes[d - 1],
      hiddenSize = hiddenSizes[d];
    model.push({
      wxh: new RandomMatrix(hiddenSize, prevSize, 0, 0.08),
      whh: new RandomMatrix(hiddenSize, hiddenSize, 0, 0.08),
      bhh: new Matrix(hiddenSize, 1)
    });
  }
  // decoder params
  model.whd = new RandomMatrix(outputSize, hiddenSize, 0, 0.08);
  model.bd = new Matrix(outputSize, 1);
  return model;
}

RNN.prototype = {
  /**
   *
   * @param {Graph} graph
   * @param prev
   * @returns {{hidden: Array, output}}
   */
  forward: function (graph, prev) {
    // forward prop for a single tick of RNN
    // G is graph to append ops to
    // model contains RNN parameters
    // x is 1D column vector with observation
    // prev is a struct containing hidden activations from last step
    var hiddenPrevs,
      d,
      hiddenSizes = this.hiddenSizes,
      x,
      model = this.model;

    if(typeof prev.hidden === 'undefined') {
      hiddenPrevs = [];
      for(d=0;d<hiddenSizes.length;d++) {
        hiddenPrevs.push(new Matrix(hiddenSizes[d],1));
      }
    } else {
      hiddenPrevs = prev.hidden;
    }

    var hidden = [];
    for(d=0;d<hiddenSizes.length;d++) {

      var inputVector = d === 0 ? x : hidden[d-1];
      var hiddenPrev = hiddenPrevs[d];

      var h0 = multiply(model[d].wxh, inputVector);
      var h1 = multiply(model[d].whh, hiddenPrev);
      var hiddenD = graph.relu(add(add(h0, h1), model[d].bhh));

      hidden.push(hiddenD);
    }

    // one decoder to outputs at end
    var output = add(multiply(model.whd, hidden[hidden.length - 1]), model.bd);

    // return cell memory, hidden representation and output
    return {
      hidden: hidden,
      output: output
    };
  }
};