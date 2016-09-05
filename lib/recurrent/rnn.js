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
    hiddenLayers: []
  };

  if (this.json) {
    this.fromJSON(this.json);
  } else {
    this.createModel();
    this.mapModel();
  }
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
  json: null
};

RNN.prototype = {
  createModel: function() {
    var hiddenSizes = this.hiddenSizes;
    var model = this.model;
    var hiddenLayers = model.hiddenLayers;
    //0 is end, so add 1 to offset
    hiddenLayers.push(this.getModel(hiddenSizes[0], this.inputSize));
    var prevSize = hiddenSizes[0];

    for(var d = 1; d < hiddenSizes.length; d++) { // loop over depths
      var hiddenSize = hiddenSizes[d];
      hiddenLayers.push(this.getModel(hiddenSize, prevSize));
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
   * @param {Object} hiddenLayer
   * @returns {Matrix}
   */
  getEquation: function(equation, inputMatrix, size, hiddenLayer) {
    var relu = equation.relu.bind(equation);
    var add = equation.add.bind(equation);
    var multiply = equation.multiply.bind(equation);
    var previousResult = equation.previousResult.bind(equation);

    return relu(
      add(
        add(
          multiply(
            hiddenLayer.weight,
            inputMatrix
          ),
          multiply(
            hiddenLayer.transition,
            previousResult(size)
          )
        ),
        hiddenLayer.bias
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
  bindEquations: function() {
    var model = this.model;
    var hiddenSizes = this.hiddenSizes;
    var hiddenLayers = model.hiddenLayers;

    var equation = new Equation();
    model.equations.push(equation);
    // 0 index
    var output = this.getEquation(equation, equation.inputMatrixToRow(this.model.input), hiddenSizes[0], hiddenLayers[0]);
    equation.addPreviousResult(output);
    // 1+ indexes
    for (var i = 1, max = hiddenSizes.length; i < max; i++) {
      output = this.getEquation(equation, output, hiddenSizes[i], hiddenLayers[i]);
      equation.addPreviousResult(output);
    }
    equation.add(equation.multiply(model.outputConnector, output), model.output);
  },

  mapModel: function() {
    var model = this.model;
    var hiddenLayers = model.hiddenLayers;
    var allMatrices = model.allMatrices;

    this.createInputMatrix();
    if (!model.input) throw new Error('net.model.input not set');

    this.createOutputMatrix();
    if (!model.outputConnector) throw new Error('net.model.outputConnector not set');
    if (!model.output) throw new Error('net.model.output not set');

    this.bindEquations();
    if (!model.equations.length > 0) throw new Error('net.equations not set');

    allMatrices.push(model.input);

    for(var i = 0, max = hiddenLayers.length; i < max; i++) {
      var hiddenMatrix = hiddenLayers[i];
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
      this.bindEquations();
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
  },

  /**
   *
   * @param input
   * @returns {*}
   */
  runInput: function(input) {
    this.outputs[0] = input;  // set output state of input layer

    for (var layer = 1; layer <= this.outputLayer; layer++) {
      for (var node = 0; node < this.sizes[layer]; node++) {
        var weights = this.weights[layer][node];

        var sum = this.biases[layer][node];
        for (var k = 0; k < weights.length; k++) {
          sum += weights[k] * input[k];
        }
        this.outputs[layer][node] = 1 / (1 + Math.exp(-sum));
      }
      var output = input = this.outputs[layer];
    }
    return output;
  },

  /**
   *
   * @param data
   * @param options
   * @returns {{error: number, iterations: number}}
   */
  train: function(data, options) {
    data = this.formatData(data);

    options = options || {};
    var iterations = options.iterations || 20000;
    var errorThresh = options.errorThresh || 0.005;
    var log = options.log ? (typeof options.log === 'function' ? options.log : console.log) : false;
    var logPeriod = options.logPeriod || 10;
    var learningRate = options.learningRate || this.learningRate || 0.3;
    var callback = options.callback;
    var callbackPeriod = options.callbackPeriod || 10;
    var sizes = [];
    var inputSize = data[0].input.length;
    var outputSize = data[0].output.length;
    var hiddenSizes = this.hiddenSizes;
    if (!hiddenSizes) {
      sizes.push(Math.max(3, Math.floor(inputSize / 2)));
    } else {
      hiddenSizes.forEach(function(size) {
        sizes.push(size);
      });
    }

    sizes.unshift(inputSize);
    sizes.push(outputSize);

    this.initialize(sizes, options.keepNetworkIntact);

    var error = 1;
    for (var i = 0; i < iterations && error > errorThresh; i++) {
      var sum = 0;
      for (var j = 0; j < data.length; j++) {
        var err = this.trainPattern(data[j].input, data[j].output, learningRate);
        sum += err;
      }
      error = sum / data.length;

      if (log && (i % logPeriod == 0)) {
        log('iterations:', i, 'training error:', error);
      }
      if (callback && (i % callbackPeriod == 0)) {
        callback({ error: error, iterations: i });
      }
    }

    return {
      error: error,
      iterations: i
    };
  },

  /**
   *
   * @param input
   * @param target
   * @param learningRate
   */
  trainPattern : function(input, target, learningRate) {
    learningRate = learningRate || this.learningRate;

    // forward propagate
    this.runInput(input);

    // back propagate
    this.calculateDeltas(target);
    this.adjustWeights(learningRate);

    var error = mse(this.errors[this.outputLayer]);
    return error;
  },

  /**
   *
   * @param target
   */
  calculateDeltas: function(target) {
    for (var layer = this.outputLayer; layer >= 0; layer--) {
      for (var node = 0; node < this.sizes[layer]; node++) {
        var output = this.outputs[layer][node];

        var error = 0;
        if (layer == this.outputLayer) {
          error = target[node] - output;
        }
        else {
          var deltas = this.deltas[layer + 1];
          for (var k = 0; k < deltas.length; k++) {
            error += deltas[k] * this.weights[layer + 1][k][node];
          }
        }
        this.errors[layer][node] = error;
        this.deltas[layer][node] = error * output * (1 - output);
      }
    }
  },

  /**
   *
   * @param learningRate
   */
  adjustWeights: function(learningRate) {
    for (var layer = 1; layer <= this.outputLayer; layer++) {
      var incoming = this.outputs[layer - 1];

      for (var node = 0; node < this.sizes[layer]; node++) {
        var delta = this.deltas[layer][node];

        for (var k = 0; k < incoming.length; k++) {
          var change = this.changes[layer][node][k];

          change = (learningRate * delta * incoming[k])
            + (this.momentum * change);

          this.changes[layer][node][k] = change;
          this.weights[layer][node][k] += change;
        }
        this.biases[layer][node] += learningRate * delta;
      }
    }
  },

  /**
   *
   * @param data
   * @returns {*}
   */
  formatData: function(data) {
    if (data.constructor !== Array) { // turn stream datum into array
      var tmp = [];
      tmp.push(data);
      data = tmp;
    }
    // turn sparse hash input into arrays with 0s as filler
    var datum = data[0].input;
    if (datum.constructor !== Array && !(datum instanceof Float64Array)) {
      if (!this.inputLookup) {
        this.inputLookup = lookup.buildLookup(data.map(function(value) { return value['input']; }));
      }
      data = data.map(function(datum) {
        var array = lookup.toArray(this.inputLookup, datum.input);
        return Object.assign({}, datum, { input: array });
      }, this);
    }

    if (data[0].output.constructor !== Array) {
      if (!this.outputLookup) {
        this.outputLookup = lookup.buildLookup(data.map(function(value) { return value['output']; }));
      }
      data = data.map(function(datum) {
        var array = lookup.toArray(this.outputLookup, datum.output);
        return Object.assign({}, datum, { output: array });
      }, this);
    }
    return data;
  },

  /**
   *
   * @param data
   * @returns {
   *  {
   *    error: number,
   *    misclasses: Array
   *  }
   * }
   */
  test : function(data) {
    data = this.formatData(data);

    // for binary classification problems with one output node
    var isBinary = data[0].output.length == 1;
    var falsePos = 0;
    var falseNeg = 0;
    var truePos = 0;
    var trueNeg = 0;

    // for classification problems
    var misclasses = [];

    // run each pattern through the trained network and collect
    // error and misclassification statistics
    var sum = 0;
    for (var i = 0; i < data.length; i++) {
      var output = this.runInput(data[i].input);
      var target = data[i].output;

      var actual, expected;
      if (isBinary) {
        actual = output[0] > this.binaryThresh ? 1 : 0;
        expected = target[0];
      }
      else {
        actual = output.indexOf(max(output));
        expected = target.indexOf(max(target));
      }

      if (actual != expected) {
        var misclass = data[i];
        Object.assign(misclass, {
          actual: actual,
          expected: expected
        });
        misclasses.push(misclass);
      }

      if (isBinary) {
        if (actual == 0 && expected == 0) {
          trueNeg++;
        }
        else if (actual == 1 && expected == 1) {
          truePos++;
        }
        else if (actual == 0 && expected == 1) {
          falseNeg++;
        }
        else if (actual == 1 && expected == 0) {
          falsePos++;
        }
      }

      var errors = output.map(function(value, i) {
        return target[i] - value;
      });
      sum += mse(errors);
    }
    var error = sum / data.length;

    var stats = {
      error: error,
      misclasses: misclasses
    };

    if (isBinary) {
      Object.assign(stats, {
        trueNeg: trueNeg,
        truePos: truePos,
        falseNeg: falseNeg,
        falsePos: falsePos,
        total: data.length,
        precision: truePos / (truePos + falsePos),
        recall: truePos / (truePos + falseNeg),
        accuracy: (trueNeg + truePos) / data.length
      });
    }
    return stats;
  },

  /**
   *
   * @returns
   *  {
   *    layers: [
   *      {
   *        x: {},
   *        y: {}
   *      },
   *      {
   *        '0': {
   *          bias: -0.98771313,
   *          weights: {
   *            x: 0.8374838,
   *            y: 1.245858
   *          },
   *        '1': {
   *          bias: 3.48192004,
   *          weights: {
   *            x: 1.7825821,
   *            y: -2.67899
   *          }
   *        }
   *      },
   *      {
   *        f: {
   *          bias: 0.27205739,
   *          weights: {
   *            '0': 1.3161821,
   *            '1': 2.00436
   *          }
   *        }
   *      }
   *    ]
   *  }
   */
  toJSON: function() {
    var model = this.model;
    return {
      type: this.constructor.name,
      input: model.input.toJSON(),
      hiddenLayers: model.hiddenLayers.map(function(hiddenLayer) {
        var layers = {};
        for (var p in hiddenLayer) {
          layers[p] = hiddenLayer[p].toJSON();
        }
        return layers;
      }),
      outputConnector: this.model.outputConnector.toJSON(),
      output: this.model.output.toJSON()
    };
  },

  fromJSON: function(json) {
    this.json = json;
    var model = this.model;
    var allMatrices = model.allMatrices;
    model.input = Matrix.fromJSON(json.input);
    allMatrices.push(model.input);
    model.hiddenLayers = json.hiddenLayers.map(function(hiddenLayer) {
      var layers = {};
      for (var p in hiddenLayer) {
        layers[p] = Matrix.fromJSON(hiddenLayer[p]);
        allMatrices.push(layers[p]);
      }
      return layers;
    });
    model.outputConnector = Matrix.fromJSON(json.outputConnector);
    model.output = Matrix.fromJSON(json.output);
    allMatrices.push(model.outputConnector, model.output);
    this.bindEquations();
  },

  /**
   *
   * @returns {Function}
   */
  toFunction: function() {
    var json = this.toJSON();
    // return standalone function that mimics run()
    return new Function('input',
      '  var net = ' + JSON.stringify(json) + ';\n\n\
  for (var i = 1; i < net.layers.length; i++) {\n\
    var layer = net.layers[i];\n\
    var output = {};\n\
    \n\
    for (var id in layer) {\n\
      var node = layer[id];\n\
      var sum = node.bias;\n\
      \n\
      for (var iid in node.weights) {\n\
        sum += node.weights[iid] * input[iid];\n\
      }\n\
      output[id] = (1 / (1 + Math.exp(-sum)));\n\
    }\n\
    input = output;\n\
  }\n\
  return output;');
  },

  /**
   * This will create a TrainStream (WriteStream) for us to send the training data to.
   * @param opts training options
   * @returns {TrainStream|*}
   */
  createTrainStream: function(opts) {
    opts = opts || {};
    opts.neuralNetwork = this;
    this.trainStream = new TrainStream(opts);
    return this.trainStream;
  }
};

/**
 *
 * @param json
 * @returns {NeuralNetwork}
 */
RNN.createFromJSON = function(json) {
  return new RNN({ json: json });
};

module.exports = RNN;
