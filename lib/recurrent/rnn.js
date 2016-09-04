var sampleI = require('./matrix/sample-i');
var maxI = require('./matrix/max-i');
var Matrix = require('./matrix');
var clone = require('./matrix/clone');
var copy = require('./matrix/copy');
var RandomMatrix = require('./matrix/random-matrix');
var softmax = require('./matrix/softmax');
var Equation = require('./equation');

function RNN(options) {
  options = options || {};

  for (var p in RNN.defaults) {
    if (RNN.defaults.hasOwnProperty(p) && p !== 'isBackPropagate') {
      this[p] = options.hasOwnProperty(p) ? options[p] : RNN.defaults[p];
    }
  }

  this.stepCache = {};
  this.runs = 0;
  this.logProbabilities = null;
  this.totalPerplexity = null;
  this.totalCost = null;

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
  inputRange: 20,
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
    //0 is end, so add 1 to offset
    hiddenMatrices.push(this.getModel(hiddenSizes[0], this.inputSize));
    var prevSize = hiddenSizes[0];

    for(var d = 1; d < hiddenSizes.length; d++) { // loop over depths
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

  /**
   *
   * @param {Equation} equation
   * @param {Matrix} inputMatrix
   * @param {Number} size
   * @param {Object} hiddenModel
   * @returns {Matrix}
   */
  getEquation: function(equation, inputMatrix, size, hiddenModel) {
    var relu = equation.relu.bind(equation);
    var add = equation.add.bind(equation);
    var multiply = equation.multiply.bind(equation);
    var previousResult = equation.previousResult.bind(equation);

    return relu(
      add(
        add(
          multiply(
            hiddenModel.weight,
            inputMatrix
          ),
          multiply(
            hiddenModel.transition,
            previousResult(size)
          )
        ),
        hiddenModel.bias
      )
    );
  },
  createInputMatrix: function() {
    //0 is end, so add 1 to offset
    this.model.input = new RandomMatrix(this.inputRange + 1, this.inputSize, 0.08);
  },
  createOutputMatrix: function() {
    var model = this.model;
    var outputSize = this.outputSize;
    var lastHiddenSize = this.hiddenSizes[this.hiddenSizes.length - 1];

    //0 is end, so add 1 to offset
    //whd
    model.outputConnector = new RandomMatrix(outputSize + 1, lastHiddenSize, 0.08);
    //0 is end, so add 1 to offset
    //bd
    model.output = new Matrix(outputSize + 1, 1);
  },
  bindEquation: function() {
    var model = this.model;
    var hiddenSizes = this.hiddenSizes;
    var hiddenMatrices = model.hiddenMatrices;

    var equation = new Equation();
    model.equations.push(equation);
    // 0 index
    var output = this.getEquation(equation, equation.inputMatrixToRow(this.model.input), hiddenSizes[0], hiddenMatrices[0]);
    equation.addPreviousResult(output);
    // 1+ indexes
    for (var i = 1, max = hiddenSizes.length; i < max; i++) {
      output = this.getEquation(equation, output, hiddenSizes[i], hiddenMatrices[i]);
      equation.addPreviousResult(output);
    }
    equation.add(equation.multiply(model.outputConnector, output), model.output);
  },

  mapModel: function() {
    var model = this.model;
    var hiddenMatrices = model.hiddenMatrices;
    var allMatrices = model.allMatrices;

    this.createInputMatrix();
    if (!model.input) throw new Error('net.model.input not set');

    this.createOutputMatrix();
    if (!model.outputConnector) throw new Error('net.model.outputConnector not set');
    if (!model.output) throw new Error('net.model.output not set');

    this.bindEquation();
    if (!model.equations.length > 0) throw new Error('net.equations not set');

    allMatrices.push(model.input);

    for(var i = 0, max = hiddenMatrices.length; i < max; i++) {
      var hiddenMatrix = hiddenMatrices[i];
      for (var property in hiddenMatrix) {
        if (!hiddenMatrix.hasOwnProperty(property)) continue;
        allMatrices.push(hiddenMatrix[property]);
      }
    }

    allMatrices.push(model.outputConnector);
    allMatrices.push(model.output);
  },

  run: function(input) {
    this.runs++;
    input = input || this.model.input;
    var equations = this.model.equations;
    var max = input.length;
    var log2ppl = 0;
    var cost = 0;

    for (var equationIndex = 0, equationMax = equations.length; equationIndex < equationMax; equationIndex++) {
      equations[equationIndex].resetPreviousResults();
    }

    while (equations.length <= max) {
      this.bindEquation();
    }

    for (var i = -1; i < max; i++) {
      // start and end tokens are zeros
      var equation = equations[i + 1];
      var ixSource = (i === -1 ? 0 : input[i]); // first step: start with START token
      var ixTarget = (i === max - 1 ? 0 : input[i + 1]); // last step: end with END token
      var output = equation.run(ixSource);
      if (equations[i + 2]) {
        equation.copyPreviousResultsTo(equations[i + 2]);
      }

      // set gradients into log probabilities
      this.logProbabilities = output; // interpret output as log probabilities
      var probabilities = softmax(output); // compute the softmax probabilities

      log2ppl += -Math.log2(probabilities.weights[ixTarget]); // accumulate base 2 log prob and do smoothing
      cost += -Math.log(probabilities.weights[ixTarget]);

      // write gradients into log probabilities
      this.logProbabilities.recurrence = probabilities.weights.slice(0);
      this.logProbabilities.recurrence[ixTarget] -= 1
    }

    while (i > -1) {
      equations[i--].runBackpropagate();
    }

    this.step();

    this.totalPerplexity = Math.pow(2, log2ppl / (max - 1));
    this.totalCost = cost;
    return output;
  },
  step: function() {
    // perform parameter update
    var stepSize = this.learningRate;
    var regc = this.regc;
    var clipval = this.clipval;
    var model = this.model;
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
    //var prev;
    var ix;
    var equation = this.model.equations[0];
    equation.resetPreviousResults();
    while (true) {
      ix = result.length === 0 ? 0 : result[result.length - 1];
      var lh = equation.run(ix);
      equation.updatePreviousResults();
      //prev = clone(lh);
      // sample predicted letter
      this.logProbabilities = lh;
      if (temperature !== 1 && _sampleI) {
        // scale log probabilities by temperature and renormalize
        // if temperature is high, logprobs will go towards zero
        // and the softmax outputs will be more diffuse. if temperature is
        // very low, the softmax outputs will be more peaky
        for (var q = 0, nq = this.logProbabilities.weights.length; q < nq; q++) {
          this.logProbabilities.weights[q] /= temperature;
        }
      }

      var probs = softmax(this.logProbabilities);

      if (_sampleI) {
        ix = sampleI(probs);
      } else {
        ix = maxI(probs);
      }

      if (ix === 0) {
        // END token predicted, break out
        break;
      }
      if (result.length > predictionLength) {
        // something is wrong
        break;
      }

      result.push(ix);
    }

    return result;
  }
};

module.exports = RNN;
