var sampleI = require('./sample-i');
var maxI = require('./max-i');
var Matrix = require('./matrix');
var RandomMatrix = require('./matrix/random');
var softmax = require('./matrix/softmax');

var equationBuilder = require('./equation-builder');

var rowPluck = equationBuilder.rowPluck;
var add = equationBuilder.add;
var multiply = equationBuilder.multiply;
var multiplyElement = equationBuilder.multiplyElement;
var relu = equationBuilder.relu;
var sigmoid = equationBuilder.sigmoid;
var tanh = equationBuilder.tanh;
var stripBackpropagationEquations = equationBuilder.stripBackpropagationEquations;
var addBackpropagationEquations = equationBuilder.addBackpropagationEquations;
var run = equationBuilder.run;
var runBackpropagate = equationBuilder.runBackpropagate;

function RNN(options) {
  options = options || {};

  for (var p in RNN.defaults) {
    if (RNN.defaults.hasOwnProperty(p) && p !== 'isBackPropagate') {
      this[p] = options.hasOwnProperty(p) ? options[p] : RNN.defaults[p];
    }
  }
  this._isBackPropagate = this.isBackPropagate;

  this.stepCache = {};

  this.model = {
    input: [],
    inputRows: [],
    equations: [],
    hidden: [],
    output: null,
    allMatrices: [],
    hiddenMatrices: []
  };

  this.createModel();
  this.mapModel();
}

RNN.defaults = {
  isBackPropagate: true,
  // hidden size should be a list
  inputSize: 20,
  hiddenSizes:[20,20],
  outputSize: 20,
  learningRate: 0.01,
  decayRate: 0.999,
  smoothEps: 1e-8,
  regc: 0.000001,
  clipval: 5,
  vocab: null
};

RNN.prototype = {
  createModel: function() {
    var hiddenSizes = this.hiddenSizes;
    var model = this.model;
    var hiddenMatrices = model.hiddenMatrices;
    var prevSize = hiddenSizes[0];

    for(var d = 0; d < hiddenSizes.length; d++) { // loop over depths
      var hiddenSize = hiddenSizes[d];
      hiddenMatrices.push(this.getModel(hiddenSize, prevSize));
      prevSize = hiddenSize;
    }
  },

  getModel: function(hiddenSize, prevSize) {
    return {
      //wxh
      weight: new RandomMatrix(hiddenSize, prevSize, 0.08),
      //whh
      transition: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      //bhh
      bias: new Matrix(hiddenSize, 1)
    };
  },

  getEquation: function(input, modelHiddenLayer, size) {
    return relu(
      add(
        add(
          multiply(
            modelHiddenLayer.weight,
            input
          ),
          multiply(
            modelHiddenLayer.transition,
            new Matrix(size, 1)
          )
        ),
        modelHiddenLayer.bias
      )
    );
  },

  get isBackPropagate() {
    return this._isBackPropagate;
  },
  set isBackPropagate(isBackPropagate) {
    this._isBackPropagate = isBackPropagate;

    if (isBackPropagate) {
      this.model.equations.forEach(addBackpropagationEquations);
    } else {
      this.model.equations.forEach(stripBackpropagationEquations);
    }
  },
  createInputsFromModel: function() {
    var model = this.model;
    var inputRows = model.inputRows;
    var inputSize = this.inputSize;
    var hiddenSizes = this.hiddenSizes;
    var input = model.input = new RandomMatrix(inputSize, hiddenSizes[0], 0.08);

    for (var i = 0; i < inputSize; i++) {
      inputRows.push(rowPluck(input, i));
    }
  },
  createHiddenMatrices: function(input) {
    var model = this.model;
    var hiddenSizes = this.hiddenSizes;
    var hiddenMatrices = model.hiddenMatrices;
    var equation = this.getEquation(input, hiddenMatrices[0], hiddenSizes[0]);
    model.equations.push(equation);
    // 0 index
    var previousEquation = equation;
    // 1+ indexes
    for (var i = 1, max = hiddenSizes.length; i < max; i++) {
      previousEquation = this.getEquation(previousEquation, hiddenMatrices[i], hiddenSizes[i]);
    }
  },
  createOutputMatrix: function() {
    var model = this.model;
    var outputSize = this.outputSize;
    var listHiddenSize = this.hiddenSizes[this.hiddenSizes.length - 1];

    //whd
    model.outputConnector = new RandomMatrix(outputSize, listHiddenSize, 0.08);
    //bd
    model.output = new Matrix(outputSize, 1);
  },
  mapModel: function() {
    var model = this.model;
    var hiddenMatrices = model.hiddenMatrices;
    var allMatrices = model.allMatrices;

    this.createInputsFromModel();
    if (!model.inputRows) throw new Error('net.inputRows not set');
    if (!model.input) throw new Error('net.model.input not set');
    allMatrices.push(model.input);

    var inputRows = model.inputRows;
    for (var i = 0, max = inputRows.length; i < max; i++) {
      this.createHiddenMatrices(inputRows[i]);
    }
    if (!model.hidden) throw new Error('net.hidden not set');

    for(i = 0, max = hiddenMatrices.length; i < max; i++) {
      var hiddenMatrix = hiddenMatrices[i];
      for (var property in hiddenMatrix) {
        if (!hiddenMatrix.hasOwnProperty(property)) continue;
        allMatrices.push(hiddenMatrix[property]);
      }
    }

    this.createOutputMatrix();
    if (!model.outputConnector) throw new Error('net.model.outputConnector not set');
    if (!model.output) throw new Error('net.model.output not set');
    allMatrices.push(model.outputConnector, model.output);
  },

  /**
   * @param {Number} inputRowIndex
   * @returns {Matrix}
   */
  forward: function (inputRowIndex) {
    return run(this.model.equations[inputRowIndex]);
  },

  // Transformer definitions
  backward: function(inputRowIndexes) {
    for (var i = 0, max = inputRowIndexes.length; i < max; i++) {
      var inputRowIndex = inputRowIndexes[i];
      runBackpropagate(this.model.equations[inputRowIndex]);
    }
  },
  /**
   *
   * @param input
   * @returns {{perplexity: Matrix, totalPerplexity: number, cost: number}}
   */
  calculateCost: function(input) {
    var n = input.length;
    var log2ppl = 0;
    var cost = 0;
    var indexes = [];
    for(var i = -1; i < n; i++) {
      // start and end tokens are zeros
      var ixSource = (i === -1 ? 0 : input[i]); // first step: start with START token
      var ixTarget = (i === n - 1 ? 0 : input[i + 1]); // last step: end with END token

      var output = this.forward(ixSource);
      indexes.push(ixSource);
      // set gradients into log probabilities
      var logProbabilities = output; // interpret output as log probabilities
      var probabilities = softmax(output); // compute the softmax probabilities

      log2ppl += -Math.log2(probabilities.weights[ixTarget]); // accumulate base 2 log prob and do smoothing
      cost += -Math.log(probabilities.weights[ixTarget]);

      // write gradients into log probabilities
      logProbabilities.recurrence = probabilities.weights;
      logProbabilities.recurrence[ixTarget] -= 1
    }

    return {
      indexes: indexes,
      perplexity: logProbabilities,
      totalPerplexity: Math.pow(2, log2ppl / (n - 1)),
      cost: cost
    };
  },
  input: function(input) {
    // evaluate cost function on an input and use built up graph to compute back propagation (set .recurrence fields in matrices)
    var out = this.calculateCost(input);
    this.backward(out.indexes);
    // perform param update
    this.step();

    return out;
  },

  inputVocab: function(value) {
    return this.input(this.vocab.toIndexes(value));
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
      if (!(matrixIndex in this.stepCache)) {
        this.stepCache[matrixIndex] = new Matrix(matrix.rows, matrix.columns);
      }
      var cache = this.stepCache[matrixIndex];

      for(var i = 0, n = matrix.weights.length; i < n; i++) {
        // rmsprop adaptive learning rate
        var mdwi = matrix.recurrence[i];
        cache.weights[i] = cache.weights[i] * this.decayRate + (1 - this.decayRate) * mdwi * mdwi;

        // gradient clip
        if (mdwi > clipval) {
          mdwi = clipval;
          numClipped++;
        }
        if (mdwi < -clipval) {
          mdwi = -clipval;
          numClipped++;
        }
        numTot++;

        // update (and regularize)
        matrix.weights[i] += -stepSize * mdwi / Math.sqrt(cache.weights[i] + this.smoothEps) - regc * matrix.weights[i];
        matrix.recurrence[i] = 0; // reset gradients for next iteration
      }
    }
    this.ratioClipped = numClipped / numTot;
  },
  predict: function(_sampleI, temperature, predictionLength) {
    if (typeof _sampleI === 'undefined') { _sampleI = true; }
    if (typeof temperature === 'undefined') { temperature = 1; }
    if (typeof predictionLength === 'undefined') { predictionLength = 100; }

    var result = [];
    var prev = {};
    var ix;
    while (true) {
      ix = result.length === 0 ? 0 : result[result.length - 1];
      var lh = this.forward(ix);
      prev = lh;
      // sample predicted letter
      var logprobs = lh;
      if (temperature !== 1 && _sampleI) {
        // scale log probabilities by temperature and renormalize
        // if temperature is high, logprobs will go towards zero
        // and the softmax outputs will be more diffuse. if temperature is
        // very low, the softmax outputs will be more peaky
        for (var q = 0, nq = logprobs.weights.length; q < nq; q++) {
          logprobs.weights[q] /= temperature;
        }
      }

      var probs = softmax(logprobs);

      if (_sampleI) {
        ix = sampleI(probs.weights);
      } else {
        ix = maxI(probs.weights);
      }

      if (ix === 0) break; // END token predicted, break out
      if (result.length > predictionLength) { break; } // something is wrong
      result.push(ix);
    }
    return result;
  },

  predictVocab: function(_sampleI, temperature, predictionLength) {
    return this.vocab.toCharacters(this.predict(_sampleI, temperature, predictionLength)).join('');
  }
};

module.exports = RNN;
