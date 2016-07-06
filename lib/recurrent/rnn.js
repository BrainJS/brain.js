var Matrix = require('./matrix'),
  RandomMatrix = require('./matrix/random'),
  add = require('./matrix/add'),
  multiply = require('./matrix/multiply');

function RNN(options) {
  options = options || {};

  for (var p in RNN.defaults) {
    this[p] = options.hasOwnProperty(p) ? options[p] : RNN.defaults;
  }

  this.backprop = [];
  this.model = [];
  this.stepCache = {};
  this.fillModel();
}

RNN.defaults = {
  needsBackprop: true,
// hidden size should be a list
  inputSize: -1,
  hiddenSizes: -1,
  outputSize: -1,
  learningRate: -1,
  decayRate: 0.999,
  smoothEps: 1e-8,
  ratioClipped: null
};

RNN.prototype = {
  fillModel: function() {
    var hiddenSizes = this.hiddenSizes;
    for(var d=0;d<hiddenSizes.length;d++) { // loop over depths
      var prevSize = d === 0 ? inputSize : hiddenSizes[d - 1],
        hiddenSize = hiddenSizes[d];
      this.model.push({
        wxh: new RandomMatrix(hiddenSize, prevSize, 0, 0.08),
        whh: new RandomMatrix(hiddenSize, hiddenSize, 0, 0.08),
        bhh: new Matrix(hiddenSize, 1)
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
   * @returns {{hidden: Array, output}}
   */
  forward: function (x, prev) {
    // forward prop for a single tick of RNN
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
      var hiddenD = this.relu(add(add(h0, h1), model[d].bhh));

      hidden.push(hiddenD);
    }

    // one decoder to outputs at end
    var output = add(multiply(model.whd, hidden[hidden.length - 1]), model.bd);

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
   * @param {Matrix} m
   * @param ix
   */
  rowPluck: function(m, ix) {
    // pluck a row of m with index ix and return it as col vector
    if (ix < 0 && ix >= m.n) throw new Error('row cannot pluck');
    var d = m.d;
    var out = new Matrix(d, 1);
    for(var i=0,n=d;i<n;i++){ out.weights[i] = m.weights[d * ix + i]; } // copy over the data

    if(this.needsBackprop) {
      this.backprop.push(function backward() {
        for(var i=0,n=d;i<n;i++){ m.dw[d * ix + i] += out.dw[i]; }
      });
    }
    return out;
  },

  /**
   *
   * @param {Matrix} m
   */
  tanh: function(m) {
    // tanh nonlinearity
    var out = new Matrix(m.n, m.d);
    var n = m.weights.length;
    for(var i=0;i<n;i++) {
      out.weights[i] = Math.tanh(m.weights[i]);
    }

    if(this.needsBackprop) {
      this.backprop.push(function backward() {
        for(var i=0;i<n;i++) {
          // grad for z = tanh(x) is (1 - z^2)
          var mwi = out.weights[i];
          m.dw[i] += (1.0 - mwi * mwi) * out.dw[i];
        }
      });
    }
    return out;
  },

  /**
   *
   * @param {Matrix} m
   */
  sigmoid: function(m) {
    // sigmoid nonlinearity
    var out = new Matrix(m.n, m.d);
    var n = m.weights.length;
    for(var i=0;i<n;i++) {
      out.weights[i] = sig(m.weights[i]);
    }

    if(this.needsBackprop) {
      this.backprop.push(function backward() {
        for(var i=0;i<n;i++) {
          // grad for z = tanh(x) is (1 - z^2)
          var mwi = out.weights[i];
          m.dw[i] += mwi * (1.0 - mwi) * out.dw[i];
        }
      });
    }
    return out;
  },

  /**
   *
   * @param {Matrix} m
   */
  relu: function(m) {
    var out = new Matrix(m.n, m.d);
    var n = m.weights.length;
    for(var i=0;i<n;i++) {
      out.weights[i] = Math.max(0, m.weights[i]); // relu
    }
    if(this.needsBackprop) {
      this.backprop.push(function backward() {
        for(var i=0;i<n;i++) {
          m.dw[i] += m.weights[i] > 0 ? out.dw[i] : 0.0;
        }
      });
    }
    return out;
  },

  costfun: function(sent) {
    // takes a model and a sentence and
    // calculates the loss. Also returns the Graph
    // object which can be used to do backprop
    var n = sent.length;
    var graph = new Graph();
    var log2ppl = 0.0;
    var cost = 0.0;
    var prev = {};
    for(var i=-1;i<n;i++) {
      // start and end tokens are zeros
      var ixSource = i === -1 ? 0 : letterToIndex[sent[i]]; // first step: start with START token
      var ixTarget = i === n-1 ? 0 : letterToIndex[sent[i+1]]; // last step: end with END token

      var lh = this.forward(ixSource, prev);
      prev = lh;

      // set gradients into logprobabilities
      var logprobs = lh.o; // interpret output as logprobs
      var probs = R.softmax(logprobs); // compute the softmax probabilities

      log2ppl += -Math.log2(probs.w[ixTarget]); // accumulate base 2 log prob and do smoothing
      cost += -Math.log(probs.w[ixTarget]);

      // write gradients into log probabilities
      logprobs.dw = probs.w;
      logprobs.dw[ixTarget] -= 1
    }
    var perplexity = Math.pow(2, log2ppl / (n - 1));

    return {
      graph: graph,
      perplexity: perplexity,
      cost: cost
    };
  },
  input: function() {
    // sample sentence fromd data
    var sentix = randi(0, data_sents.length);
    var sent = data_sents[sentix];
    // evaluate cost function on a sentence
    var cost_struct = this.costfun(sent);

    // use built up graph to compute backprop (set .dw fields in mats)
    this.backward();
    // perform param update
    return this.step(this.learningRate, regc, clipval);
  },

  step: function(stepSize, regc, clipval) {
    // perform parameter update
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
          var mdwi = m.dw[i];
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
          m.dw[i] = 0; // reset gradients for next iteration
        }
      }
    }
    this.ratioClipped = numClipped*1.0/numTot;

    return this;
  }
};

function sig(x) {
  // helper function for computing sigmoid
  return 1.0 / (1 + Math.exp(-x));
}

module.exports = RNN;