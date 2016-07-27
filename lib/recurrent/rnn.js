var sampleI = require('./sample-i');
var maxI = require('./max-i');
var Matrix = require('./matrix');
var RandomMatrix = require('./matrix/random');
var softmax = require('./matrix/softmax');

var rowPluck = require('./matrix/row-pluck');
var rowPluckB = require('./matrix/row-pluck-b');

var add = require('./matrix/add');
var addB = require('./matrix/add-b');
var multiply = require('./matrix/multiply');
var multiplyB = require('./matrix/multiply-b');
var multiplyElement = require('./matrix/multiply-element');
var multiplyElementB = require('./matrix/multiply-element-b');

var relu = require('./matrix/relu');
var reluB = require('./matrix/relu-b');
var sigmoid = require('./matrix/sigmoid');
var sigmoidB = require('./matrix/sigmoid-b');
var tanh = require('./matrix/tanh');
var tanhB = require('./matrix/tanh-b');

function RNN(options) {
  options = options || {};

  for (var p in RNN.defaults) {
    if (RNN.defaults.hasOwnProperty(p)) {
      this[p] = options.hasOwnProperty(p) ? options[p] : RNN.defaults[p];
    }
  }

  if (this.needsBackprop) {
    this.rowPluck = rowPluckB;

    this.add = addB;
    this.multiply = multiplyB;
    this.multiplyElement = multiplyElementB;

    this.relu = reluB;
    this.sigmoid = sigmoidB;
    this.tahn = tanhB;
  } else {
    this.rowPluck = rowPluck;

    this.add = add;
    this.multiply = multiply;
    this.multiplyElement = multiplyElement;

    this.relu = relu;
    this.sigmoid = sigmoid;
    this.tahn = tanh;
  }

  this.backprop = [];
  this.stepCache = {};
  this.model = {
    allMatrices: [],
    hiddenMatrices: []
  };
  this.fillModel();
}

RNN.defaults = {
  needsBackprop: true,
  // hidden size should be a list
  inputSize: 20,
  hiddenSizes:[20,20],
  outputSize: 20,
  learningRate: 0.8,
  decayRate: 0.999,
  smoothEps: 1e-8,
  ratioClipped: null,
  regc: null,
  clipval: null
};

RNN.prototype = {
  fillModel: function() {
    var hiddenSizes = this.hiddenSizes;
    var inputSize = this.inputSize;
    var outputSize = this.outputSize;
    var model = this.model;
    var hiddenMatrices = model.hiddenMatrices;
    var allMatrices = model.allMatrices;

    //wil
    model.input = new RandomMatrix(this.inputSize, this.hiddenSizes[0], 0, 0.08);
    allMatrices.push(model.input);

    for(var d = 0; d < hiddenSizes.length; d++) { // loop over depths
      var prevSize = d === 0 ? inputSize : hiddenSizes[d - 1];
      var hiddenSize = hiddenSizes[d];
      var weight = new RandomMatrix(hiddenSize, prevSize, 0, 0.08);
      var transition = new RandomMatrix(hiddenSize, hiddenSize, 0, 0.08);
      var bias = new Matrix(hiddenSize, 1);
      hiddenMatrices.push({
        //wxh
        weight: weight,
        //whh
        transition: transition,
        //bhh
        bias: bias
      });

      allMatrices.push(weight, transition, bias);
    }

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
   * @returns {{hidden: Array, output}}
   */
  forward: function (inputRowIndex, prev) {
    // forward prop for a single tick of RNN
    // model contains RNN parameters
    // x is 1D column vector with observation
    // prev is a struct containing hidden activations from last step
    var inputRow = this.rowPluck(this.model.input, inputRowIndex, this);
    var hiddenPrevs;
    var d;
    var hiddenSizes = this.hiddenSizes;
    var model = this.model;

    if(typeof prev.hidden === 'undefined') {
      hiddenPrevs = [];
      for(d = 0; d < hiddenSizes.length; d++) {
        hiddenPrevs.push(new Matrix(hiddenSizes[d], 1));
      }
    } else {
      hiddenPrevs = prev.hidden;
    }

    var hidden = [];
    for(d = 0; d < hiddenSizes.length; d++) {

      var inputVector = d === 0 ? inputRow : hidden[d-1];
      var hiddenPrev = hiddenPrevs[d];
      var hiddenMatrix = model.hiddenMatrices[d];

      var h0 = this.multiply(hiddenMatrix.weight, inputVector, this);
      var h1 = this.multiply(hiddenMatrix.transition, hiddenPrev, this);
      var hiddenD = this.relu(this.add(this.add(h0, h1, this), hiddenMatrix.bias, this), this);

      hidden.push(hiddenD);
    }

    // one decoder to outputs at end
    var output = this.add(this.multiply(model.outputConnector, hidden[hidden.length - 1], this), model.output, this);

    // return cell memory, hidden representation and output
    return {
      hidden: hidden,
      output: output
    };
  },

  // Transformer definitions
  backward: function() {
    while(this.backprop.length > 1) {
      this.backprop.pop()(); // tick!
    }

    return this;
  },
  /**
   *
   * @param input
   * @returns {{perplexity: Matrix, totalPerplexity: number, cost: number}}
   */
  calculateCost: function(input) {
    var n = input.length;
    var log2ppl = 0.0;
    var cost = 0.0;
    var prev = {};
    for(var i = -1; i < n; i++) {
      // start and end tokens are zeros
      var ixSource = i === -1 ? 0 : input[i]; // first step: start with START token
      var ixTarget = i === n-1 ? 0 : input[i+1]; // last step: end with END token

      var lh = this.forward(ixSource, prev);
      prev = lh;

      // set gradients into log probabilities
      var logProbabilities = lh.output; // interpret output as log probabilities
      var probabilities = softmax(logProbabilities); // compute the softmax probabilities

      log2ppl += -Math.log2(probabilities.weights[ixTarget]); // accumulate base 2 log prob and do smoothing
      cost += -Math.log(probabilities.weights[ixTarget]);

      // write gradients into log probabilities
      logProbabilities.recurrence = probabilities.weights;
      logProbabilities.recurrence[ixTarget] -= 1
    }

    return {
      perplexity: logProbabilities,
      totalPerplexity: Math.pow(2, log2ppl / (n - 1)),
      cost: cost
    };
  },
  input: function(input) {
    // evaluate cost function on an input and use built up graph to compute back propagation (set .recurrence fields in matrices)
    this.calculateCost(input);
    this.backward();
    // perform param update
    this.step();

    return this;
  },

  step: function() {
    // perform parameter update
    var stepSize = this.learningRate;
    var regc = this.regc;
    var clipval = this.clipval;
    var model = this.model;
    var solverStats = {};
    var numClipped = 0;
    var numTot = 0;
    var allMatrices = model.allMatrices;
    var matrixIndexes = allMatrices.length;
    for(var matrixIndex = 0; matrixIndex < matrixIndexes; matrixIndex++) {
      var matrix = allMatrices[matrixIndex];
      if(!(matrixIndex in this.stepCache)) {
        this.stepCache[matrixIndex] = new Matrix(matrix.rows, matrix.columns);
      }
      var cache = this.stepCache[matrixIndex];

      for(var i = 0, n = matrix.weights.length; i < n; i++) {
        // rmsprop adaptive learning rate
        var mdwi = matrix.recurrence[i];
        cache.weights[i] = cache.weights[i] * this.decayRate + (1.0 - this.decayRate) * mdwi * mdwi;

        // gradient clip
        if(mdwi > clipval) {
          mdwi = clipval;
          numClipped++;
        }
        if(mdwi < -clipval) {
          mdwi = -clipval;
          numClipped++;
        }
        numTot++;

        // update (and regularize)
        matrix.weights[i] += - stepSize * mdwi / Math.sqrt(cache.weights[i] + this.smoothEps) - regc * matrix.weights[i];
        matrix.recurrence[i] = 0; // reset gradients for next iteration
      }
    }
    this.ratioClipped = numClipped * 1.0 / numTot;

    return this;
  },
  predict: function(samplei, temperature, predictionLength) {
    if (typeof samplei === 'undefined') { samplei = false; }
    if (typeof temperature === 'undefined') { temperature = 1.0; }
    if (typeof predictionLength === 'undefined') { predictionLength = 100; }
    var result = [];
    var prev = {};
    var ix;
    while (true) {
      ix = result.length === 0 ? 0 : result[result.length - 1];
      var lh = this.forward(ix, prev);
      prev = lh;
      // sample predicted letter
      var logprobs = lh.output;
      if (temperature !== 1.0 && samplei) {
        // scale log probabilities by temperature and renormalize
        // if temperature is high, logprobs will go towards zero
        // and the softmax outputs will be more diffuse. if temperature is
        // very low, the softmax outputs will be more peaky
        for (var q = 0, nq = logprobs.weights.length; q < nq; q++) {
          logprobs.weights[q] /= temperature;
        }
      }

      var probs = softmax(logprobs);

      if(samplei) {
        ix = sampleI(probs.weights);
      } else {
        ix = maxI(probs.weights);
      }

      if(ix === 0) break; // END token predicted, break out
      if(result.length > predictionLength) { break; } // something is wrong
      result.push(ix);
    }
    return result;
  }
};

module.exports = RNN;
