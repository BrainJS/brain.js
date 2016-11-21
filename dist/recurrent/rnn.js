'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _matrix = require('./matrix');

var _matrix2 = _interopRequireDefault(_matrix);

var _sampleI2 = require('./matrix/sample-i');

var _sampleI3 = _interopRequireDefault(_sampleI2);

var _maxI = require('./matrix/max-i');

var _maxI2 = _interopRequireDefault(_maxI);

var _randomMatrix = require('./matrix/random-matrix');

var _randomMatrix2 = _interopRequireDefault(_randomMatrix);

var _softmax = require('./matrix/softmax');

var _softmax2 = _interopRequireDefault(_softmax);

var _equation = require('./matrix/equation');

var _equation2 = _interopRequireDefault(_equation);

var _copy = require('./matrix/copy');

var _copy2 = _interopRequireDefault(_copy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaults = {
  isBackPropagate: true,
  // hidden size should be a list
  inputSize: 20,
  inputRange: 20,
  hiddenSizes: [20, 20],
  outputSize: 20,
  learningRate: 0.01,
  decayRate: 0.999,
  smoothEps: 1e-8,
  regc: 0.000001,
  clipval: 5,
  json: null
};

var RNN = function () {
  function RNN(options) {
    _classCallCheck(this, RNN);

    options = options || {};

    for (var p in defaults) {
      if (defaults.hasOwnProperty(p) && p !== 'isBackPropagate') {
        this[p] = options.hasOwnProperty(p) ? options[p] : defaults[p];
      }
    }

    this.stepCache = {};
    this.runs = 0;
    this.totalPerplexity = null;
    this.totalCost = null;
    this.ratioClipped = null;

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

  _createClass(RNN, [{
    key: 'createModel',
    value: function createModel() {
      var hiddenSizes = this.hiddenSizes;
      var model = this.model;
      var hiddenLayers = model.hiddenLayers;
      //0 is end, so add 1 to offset
      hiddenLayers.push(this.getModel(hiddenSizes[0], this.inputSize));
      var prevSize = hiddenSizes[0];

      for (var d = 1; d < hiddenSizes.length; d++) {
        // loop over depths
        var hiddenSize = hiddenSizes[d];
        hiddenLayers.push(this.getModel(hiddenSize, prevSize));
        prevSize = hiddenSize;
      }
    }
  }, {
    key: 'getModel',
    value: function getModel(hiddenSize, prevSize) {
      return {
        //wxh
        weight: new _randomMatrix2.default(hiddenSize, prevSize, 0.08),
        //whh
        transition: new _randomMatrix2.default(hiddenSize, hiddenSize, 0.08),
        //bhh
        bias: new _matrix2.default(hiddenSize, 1)
      };
    }

    /**
     *
     * @param {Equation} equation
     * @param {Matrix} inputMatrix
     * @param {Number} size
     * @param {Object} hiddenLayer
     * @returns {Matrix}
     */

  }, {
    key: 'getEquation',
    value: function getEquation(equation, inputMatrix, size, hiddenLayer) {
      var relu = equation.relu.bind(equation);
      var add = equation.add.bind(equation);
      var multiply = equation.multiply.bind(equation);
      var previousResult = equation.previousResult.bind(equation);
      var result = equation.result.bind(equation);

      return result(relu(add(add(multiply(hiddenLayer.weight, inputMatrix), multiply(hiddenLayer.transition, previousResult(size))), hiddenLayer.bias)));
    }
  }, {
    key: 'createInputMatrix',
    value: function createInputMatrix() {
      //0 is end, so add 1 to offset
      this.model.input = new _randomMatrix2.default(this.inputRange + 1, this.inputSize, 0.08);
    }
  }, {
    key: 'createOutputMatrix',
    value: function createOutputMatrix() {
      var model = this.model;
      var outputSize = this.outputSize;
      var lastHiddenSize = this.hiddenSizes[this.hiddenSizes.length - 1];

      //0 is end, so add 1 to offset
      //whd
      model.outputConnector = new _randomMatrix2.default(outputSize + 1, lastHiddenSize, 0.08);
      //0 is end, so add 1 to offset
      //bd
      model.output = new _matrix2.default(outputSize + 1, 1);
    }
  }, {
    key: 'bindEquation',
    value: function bindEquation() {
      var model = this.model;
      var hiddenSizes = this.hiddenSizes;
      var hiddenLayers = model.hiddenLayers;
      var equation = new _equation2.default();
      // 0 index
      var output = this.getEquation(equation, equation.inputMatrixToRow(model.input), hiddenSizes[0], hiddenLayers[0]);
      // 1+ indexes
      for (var i = 1, max = hiddenSizes.length; i < max; i++) {
        output = this.getEquation(equation, output, hiddenSizes[i], hiddenLayers[i]);
      }
      equation.add(equation.multiply(model.outputConnector, output), model.output);
      model.allMatrices = model.allMatrices.concat(equation.allMatrices);
      model.equations.push(equation);
    }
  }, {
    key: 'mapModel',
    value: function mapModel() {
      var model = this.model;
      var hiddenLayers = model.hiddenLayers;
      var allMatrices = model.allMatrices;

      this.createInputMatrix();
      if (!model.input) throw new Error('net.model.input not set');

      this.createOutputMatrix();
      if (!model.outputConnector) throw new Error('net.model.outputConnector not set');
      if (!model.output) throw new Error('net.model.output not set');

      this.bindEquation();
      if (!model.equations.length) throw new Error('net.equation not set');

      allMatrices.push(model.input);

      for (var i = 0, max = hiddenLayers.length; i < max; i++) {
        var hiddenMatrix = hiddenLayers[i];
        for (var property in hiddenMatrix) {
          if (!hiddenMatrix.hasOwnProperty(property)) continue;
          allMatrices.push(hiddenMatrix[property]);
        }
      }

      allMatrices.push(model.outputConnector);
      allMatrices.push(model.output);
    }
  }, {
    key: 'run',
    value: function run(input) {
      this.train(input);
      this.runBackpropagate(input);
      this.step(input);
    }
  }, {
    key: 'runPredict',
    value: function runPredict() {
      var prediction = this.predict();
      this.runBackpropagate(prediction);
      this.step(prediction);
      return prediction;
    }
  }, {
    key: 'train',
    value: function train(input) {
      this.runs++;
      var model = this.model;
      var max = input.length;
      var log2ppl = 0;
      var cost = 0;

      var i = void 0;
      var equation = void 0;
      while (model.equations.length <= input.length + 1) {
        //first and last are zeros
        this.bindEquation();
      }
      for (i = -1; i < max; i++) {
        // start and end tokens are zeros
        equation = model.equations[i + 1];

        var ixSource = i === -1 ? 0 : input[i] + 1; // first step: start with START token
        var ixTarget = i === max - 1 ? 0 : input[i + 1] + 1; // last step: end with END token
        var output = equation.run(ixSource);
        // set gradients into log probabilities
        var logProbabilities = output; // interpret output as log probabilities
        var probabilities = (0, _softmax2.default)(output); // compute the softmax probabilities

        log2ppl += -Math.log2(probabilities.weights[ixTarget]); // accumulate base 2 log prob and do smoothing
        cost += -Math.log(probabilities.weights[ixTarget]);

        // write gradients into log probabilities
        logProbabilities.recurrence = probabilities.weights;
        logProbabilities.recurrence[ixTarget] -= 1;
      }

      this.totalPerplexity = Math.pow(2, log2ppl / (max - 1));
      this.totalCost = cost;
    }
  }, {
    key: 'runBackpropagate',
    value: function runBackpropagate(input) {
      var i = input.length + 0;
      var model = this.model;
      var equations = model.equations;
      while (i > 0) {
        equations[i].runBackpropagate(input[i - 1] + 1);
        i--;
      }
      equations[0].runBackpropagate(0);
    }
  }, {
    key: 'step',
    value: function step() {
      // perform parameter update
      var stepSize = this.learningRate;
      var regc = this.regc;
      var clipval = this.clipval;
      var model = this.model;
      var numClipped = 0;
      var numTot = 0;
      var allMatrices = model.allMatrices;
      var matrixIndexes = allMatrices.length;
      for (var matrixIndex = 0; matrixIndex < matrixIndexes; matrixIndex++) {
        var matrix = allMatrices[matrixIndex];
        if (!(matrixIndex in this.stepCache)) {
          this.stepCache[matrixIndex] = new _matrix2.default(matrix.rows, matrix.columns);
        }
        var cache = this.stepCache[matrixIndex];

        for (var i = 0, n = matrix.weights.length; i < n; i++) {
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
          matrix.weights[i] = matrix.weights[i] + -stepSize * mdwi / Math.sqrt(cache.weights[i] + this.smoothEps) - regc * matrix.weights[i];
          matrix.recurrence[i] = 0; // reset gradients for next iteration
        }
      }
      this.ratioClipped = numClipped / numTot;
    }
  }, {
    key: 'predict',
    value: function predict(predictionLength, _sampleI, temperature) {
      if (typeof _sampleI === 'undefined') {
        _sampleI = false;
      }
      if (typeof temperature === 'undefined') {
        temperature = 1;
      }
      if (typeof predictionLength === 'undefined') {
        predictionLength = 100;
      }
      var model = this.model;
      var result = [];
      var ix = void 0;
      var equation = void 0;
      var i = 0;
      while (model.equations.length < predictionLength) {
        this.bindEquation();
      }
      var output = new _matrix2.default(model.output.rows, model.output.columns);
      while (true) {
        if (i >= predictionLength) {
          // something is wrong
          break;
        }
        ix = result.length === 0 ? 0 : result[result.length - 1];
        equation = model.equations[i];
        (0, _copy2.default)(output, equation.run(ix));
        var lh = output;
        // sample predicted letter
        var logProbabilities = lh;
        if (temperature !== 1 && _sampleI) {
          // scale log probabilities by temperature and renormalize
          // if temperature is high, logprobs will go towards zero
          // and the softmax outputs will be more diffuse. if temperature is
          // very low, the softmax outputs will be more peaky
          for (var q = 0, nq = logProbabilities.weights.length; q < nq; q++) {
            logProbabilities.weights[q] /= temperature;
          }
        }

        var probs = (0, _softmax2.default)(logProbabilities);

        if (_sampleI) {
          ix = (0, _sampleI3.default)(probs);
        } else {
          ix = (0, _maxI2.default)(probs);
        }

        i++;
        if (ix === 0) {
          // END token predicted, break out
          break;
        }

        result.push(ix);
      }

      return result;
    }

    /**
     *
     * @param input
     * @returns {*}
     */

  }, {
    key: 'runInput',
    value: function runInput(input) {
      this.outputs[0] = input; // set output state of input layer

      var output = null;
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        for (var node = 0; node < this.sizes[layer]; node++) {
          var weights = this.weights[layer][node];

          var sum = this.biases[layer][node];
          for (var k = 0; k < weights.length; k++) {
            sum += weights[k] * input[k];
          }
          this.outputs[layer][node] = 1 / (1 + Math.exp(-sum));
        }
        output = input = this.outputs[layer];
      }
      return output;
    }

    /**
     *
     * @param data
     * @param options
     * @returns {{error: number, iterations: number}}
     */
    /*train(data, options) {
      throw new Error('not yet implemented');
      //data = this.formatData(data);
       options = options || {};
      let iterations = options.iterations || 20000;
      let errorThresh = options.errorThresh || 0.005;
      let log = options.log ? (typeof options.log === 'function' ? options.log : console.log) : false;
      let logPeriod = options.logPeriod || 10;
      let learningRate = options.learningRate || this.learningRate || 0.3;
      let callback = options.callback;
      let callbackPeriod = options.callbackPeriod || 10;
      let sizes = [];
      let inputSize = data[0].input.length;
      let outputSize = data[0].output.length;
      let hiddenSizes = this.hiddenSizes;
      if (!hiddenSizes) {
        sizes.push(Math.max(3, Math.floor(inputSize / 2)));
      } else {
        hiddenSizes.forEach(function(size) {
          sizes.push(size);
        });
      }
       sizes.unshift(inputSize);
      sizes.push(outputSize);
       //this.initialize(sizes, options.keepNetworkIntact);
       let error = 1;
      for (let i = 0; i < iterations && error > errorThresh; i++) {
        let sum = 0;
        for (let j = 0; j < data.length; j++) {
          let err = this.trainPattern(data[j].input, data[j].output, learningRate);
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
    }*/

    /**
     *
     * @param input
     * @param target
     * @param learningRate
     */

  }, {
    key: 'trainPattern',
    value: function trainPattern(input, target, learningRate) {
      throw new Error('not yet implemented');
    }

    /**
     *
     * @param target
     */

  }, {
    key: 'calculateDeltas',
    value: function calculateDeltas(target) {
      throw new Error('not yet implemented');
    }

    /**
     *
     * @param learningRate
     */

  }, {
    key: 'adjustWeights',
    value: function adjustWeights(learningRate) {
      throw new Error('not yet implemented');
    }

    /**
     *
     * @param data
     * @returns {*}
     */

  }, {
    key: 'formatData',
    value: function formatData(data) {
      throw new Error('not yet implemented');
    }

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

  }, {
    key: 'test',
    value: function test(data) {
      throw new Error('not yet implemented');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var model = this.model;
      var options = {};
      for (var p in defaults) {
        options[p] = this[p];
      }

      return {
        type: this.constructor.name,
        options: options,
        input: model.input.toJSON(),
        hiddenLayers: model.hiddenLayers.map(function (hiddenLayer) {
          var layers = {};
          for (var _p in hiddenLayer) {
            layers[_p] = hiddenLayer[_p].toJSON();
          }
          return layers;
        }),
        outputConnector: this.model.outputConnector.toJSON(),
        output: this.model.output.toJSON()
      };
    }
  }, {
    key: 'fromJSON',
    value: function fromJSON(json) {
      this.json = json;
      var model = this.model;
      var options = json.options;
      var allMatrices = model.allMatrices;
      model.input = _matrix2.default.fromJSON(json.input);
      allMatrices.push(model.input);
      model.hiddenLayers = json.hiddenLayers.map(function (hiddenLayer) {
        var layers = {};
        for (var p in hiddenLayer) {
          layers[p] = _matrix2.default.fromJSON(hiddenLayer[p]);
          allMatrices.push(layers[p]);
        }
        return layers;
      });
      model.outputConnector = _matrix2.default.fromJSON(json.outputConnector);
      model.output = _matrix2.default.fromJSON(json.output);
      allMatrices.push(model.outputConnector, model.output);

      for (var p in defaults) {
        if (defaults.hasOwnProperty(p) && p !== 'isBackPropagate') {
          this[p] = options.hasOwnProperty(p) ? options[p] : defaults[p];
        }
      }

      this.bindEquation();
    }

    /**
     *
     * @returns {Function}
     */

  }, {
    key: 'toFunction',
    value: function toFunction() {
      var model = this.model;
      var equation = this.model.equations[0];
      var states = equation.states;
      var modelAsString = JSON.stringify(this.toJSON());

      function matrixOrigin(m, requestedStateIndex) {
        for (var i = 0, max = states.length; i < max; i++) {
          var state = states[i];

          if (i === requestedStateIndex) {
            switch (m) {
              case state.product:
              case state.left:
              case state.right:
                return 'new Matrix(' + m.rows + ', ' + m.columns + ')';
            }
          }

          if (m === state.product) return 'states[' + i + '].product';
          if (m === state.right) return 'states[' + i + '].right';
          if (m === state.left) return 'states[' + i + '].left';
        }
      }

      function matrixToString(m, stateIndex) {
        if (!m) return 'null';

        for (var i = 0, max = model.hiddenLayers.length; i < max; i++) {
          var hiddenLayer = model.hiddenLayers[i];
          for (var p in hiddenLayer) {
            if (hiddenLayer[p] === m) {
              return 'model.hiddenLayers[' + i + '].' + p;
            }
          }
        }
        if (m === model.input) return 'model.input';
        if (m === model.outputConnector) return 'model.outputConnector';
        if (m === model.output) return 'model.output';
        return matrixOrigin(m, stateIndex);
      }

      function toInner(fnString) {
        //crude, but should be sufficient for now
        //function() { inner.function.string.here; }
        fnString = fnString.toString().split('{');
        fnString.shift();
        // inner.function.string.here; }
        fnString = fnString.join('{');
        fnString = fnString.split('}');
        fnString.pop();
        // inner.function.string.here;
        return fnString.join('}');
      }

      function fileName(fnName) {
        return 'src/recurrent/matrix/' + fnName.replace(/[A-Z]/g, function (value) {
          return '-' + value.toLowerCase();
        }) + '.js';
      }

      var statesRaw = [];
      var usedFunctionNames = {};
      var innerFunctionsSwitch = [];
      for (var i = 0, max = states.length; i < max; i++) {
        var state = states[i];
        statesRaw.push('states[' + i + '] = {\n        name: \'' + state.forwardFn.name + '\',\n        left: ' + matrixToString(state.left, i) + ',\n        right: ' + matrixToString(state.right, i) + ',\n        product: ' + matrixToString(state.product, i) + '\n      };');

        var fnName = state.forwardFn.name;
        if (!usedFunctionNames[fnName]) {
          usedFunctionNames[fnName] = true;
          innerFunctionsSwitch.push('\n        case \'' + fnName + '\': //compiled from ' + fileName(fnName) + '\n          ' + toInner(state.forwardFn.toString()) + '\n          break;\n        ');
        }
      }

      return new Function('input', '\n      var model = ' + modelAsString + ';\n      \n      function Matrix(rows, columns) {\n        this.rows = rows;\n        this.columns = columns;\n        this.weights = zeros(rows * columns);\n        this.recurrence = zeros(rows * columns);\n      }\n      \n      function zeros(size) {\n        if (typeof Float64Array !== \'undefined\') return new Float64Array(size);\n        var array = new Array(size);\n        for (var i = 0; i < size; i++) {\n          array[i] = 0;\n        }\n        return array;\n      }\n      \n      for (var inputIndex = 0, inputMax = input.length; inputIndex < inputMax; inputIndex++) {\n        var ixSource = (inputIndex === -1 ? 0 : input[inputIndex]); // first step: start with START token\n        var ixTarget = (inputIndex === inputMax - 1 ? 0 : input[inputIndex + 1]); // last step: end with END token\n        var rowPluckIndex = inputIndex; //connect up to rowPluck\n        var states = {};\n        ' + statesRaw.join('\n') + '\n        for (var stateIndex = 0, stateMax = ' + statesRaw.length + '; stateIndex < stateMax; stateIndex++) {\n          var state = states[stateIndex];\n          var product = state.product;\n          var left = state.left;\n          var right = state.right;\n          \n          switch (state.name) {\n            ' + innerFunctionsSwitch.join('\n') + '\n          }\n        }\n      }\n      \n      return state.product;\n    ');
    }
  }]);

  return RNN;
}();

exports.default = RNN;
//# sourceMappingURL=rnn.js.map