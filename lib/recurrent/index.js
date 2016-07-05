//http://colah.github.io/posts/2015-08-Understanding-LSTMs/
var Matrix = require('./matrix'),
  RNN = require('./rnn'),
  LSTM = require('./lstm');

// Transformer definitions
function Graph(needsBackprop) {
  if(typeof needsBackprop === 'undefined') { needsBackprop = true; }
  this.needsBackprop = needsBackprop;

  // this will store a list of functions that perform backprop,
  // in their forward pass order. So in backprop we will go
  // backwards and evoke each one
  this.backprop = [];
}
Graph.prototype = {
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
  }
};

function Solver() {
  this.decayRate = 0.999;
  this.smoothEps = 1e-8;
  this.stepCache = {};
  this.ratioClipped = null;
}
Solver.prototype = {
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

// various utils
module.exports = {
  // classes
  LSTM: LSTM,
  RNN: RNN,

  // optimization
  Solver: Solver,
  Graph: Graph
};