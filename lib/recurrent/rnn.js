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
  this.model = [];
  this.stepCache = {};
  this.fillModel();
}

RNN.defaults = {
  needsBackprop: true,
  // hidden size should be a list
  inputSize: 2,
  hiddenSizes:[20,20],
  outputSize: 1,
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

    //this.model.wil = new RandomMatrix(input_size, letter_size , 0, 0.08);
    for(var d = 0; d < hiddenSizes.length; d++) { // loop over depths
      var prevSize = d === 0 ? inputSize : hiddenSizes[d - 1],
        hiddenSize = hiddenSizes[d];

      this.model.push({
        wxh: new RandomMatrix(hiddenSize, prevSize, 0, 0.08),
        whh: new RandomMatrix(hiddenSize, hiddenSize, 0, 0.08),
        bhh: new Matrix(hiddenSize, 1)
      });
    }

    // decoder params
    this.model.whd = new RandomMatrix(this.outputSize, hiddenSize, 0, 0.08);
    this.model.bd = new Matrix(this.outputSize, 1);

    return this;
  },
  /**
   *
   * @param prev
   * @returns {{hidden: Array, output}}
   */
  forward: function (x, prev) {
    // forward prop for a single tick of RNN
    // model contains RNN parameters
    // x is 1D column vector with observation
    // prev is a struct containing hidden activations from last step
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

      var inputVector = d === 0 ? x : hidden[d-1];
      var hiddenPrev = hiddenPrevs[d];

      var h0 = this.multiply(model[d].wxh, inputVector, this);
      var h1 = this.multiply(model[d].whh, hiddenPrev, this);
      var hiddenD = this.relu(this.add(this.add(h0, h1, this), model[d].bhh, this), this);

      hidden.push(hiddenD);
    }

    // one decoder to outputs at end
    var output = this.add(this.multiply(model.whd, hidden[hidden.length - 1], this), model.bd, this);

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
      var probabilities = this.softmax(logProbabilities); // compute the softmax probabilities

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
    for(var k in model) {
      if(model.hasOwnProperty(k)) {
        var m = model[k]; // mat ref
        if(!(k in this.stepCache)) { this.stepCache[k] = new Matrix(m.n, m.d); }
        var s = this.stepCache[k];
        for(var i=0,n=m.weights.length;i<n;i++) {

          // rmsprop adaptive learning rate
          var mdwi = m.recurrence[i];
          s.weights[i] = s.weights[i] * this.decayRate + (1.0 - this.decayRate) * mdwi * mdwi;

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
          m.weights[i] += - stepSize * mdwi / Math.sqrt(s.weights[i] + this.smoothEps) - regc * m.weights[i];
          m.recurrence[i] = 0; // reset gradients for next iteration
        }
      }
    }
    this.ratioClipped = numClipped * 1.0 / numTot;

    return this;
  }
};

module.exports = RNN;