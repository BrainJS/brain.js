var zeros = require('./zeros'),
  random = require('./random'),
  randf = random.f,
  randn = random.n;

/**
 * A matrix
 * @param {Number} n
 * @param {Number} d
 * @constructor
 */
function Matrix(n, d) {
  // n is number of rows d is number of columns
  this.n = n;
  this.d = d;
  this.weights = zeros(n * d);
  this.dw = zeros(n * d);
}

Matrix.prototype = {
  getWeights: function(row, col) {
    // slow but careful accessor function
    // we want row-major order
    var ix = (this.d * row) + col;
    if (ix < 0 && ix >= this.weights.length) throw new Error('get accessor is skewed');
    return this.weights[ix];
  },
  setWeights: function(row, col, v) {
    // slow but careful accessor function
    var ix = (this.d * row) + col;
    if (ix < 0 && ix >= this.weights.length) throw new Error('set accessor is skewed');
    this.weights[ix] = v;
  },
  toJSON: function() {
    var weights = [];
    for (var i = 0; i < this.weights.length; i++) {
      weights.push(this.weights[i]);
    }
    return {
      n: this.n,
      d: this.d,
      weights: weights
    };
  },
  fromJSON: function(json) {
    this.n = json.n;
    this.d = json.d;
    this.weights = zeros(this.n * this.d);
    this.dw = zeros(this.n * this.d);
    for(var i=0,n=this.n * this.d;i<n;i++) {
      this.weights[i] = json.weights[i]; // copy over weights
    }
  },

  // fill matrix with random gaussian numbers
  fillRandN: function(mu, std) {
    for(var i=0,n=this.weights.length;i<n;i++) {
      this.weights[i] = randn(mu, std);
    }
  },

  // fill matrix with random gaussian numbers
  fillRand: function(lo, hi) {
    for(var i=0,n=this.weights.length;i<n;i++) {
      this.weights[i] = randf(lo, hi);
    }
  }
};

module.exports = Matrix;