'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _matrix = require('./matrix');

var _matrix2 = _interopRequireDefault(_matrix);

var _randomMatrix = require('./matrix/random-matrix');

var _randomMatrix2 = _interopRequireDefault(_randomMatrix);

var _equation = require('./matrix/equation');

var _equation2 = _interopRequireDefault(_equation);

var _sampleI = require('./matrix/sample-i');

var _sampleI2 = _interopRequireDefault(_sampleI);

var _maxI = require('./matrix/max-i');

var _maxI2 = _interopRequireDefault(_maxI);

var _softmax = require('./matrix/softmax');

var _softmax2 = _interopRequireDefault(_softmax);

var _copy = require('./matrix/copy');

var _copy2 = _interopRequireDefault(_copy);

var _random = require('../utilities/random');

var _zeros = require('../utilities/zeros');

var _zeros2 = _interopRequireDefault(_zeros);

var _dataFormatter = require('../utilities/data-formatter');

var _dataFormatter2 = _interopRequireDefault(_dataFormatter);

var _neuralNetwork = require('../neural-network');

var _neuralNetwork2 = _interopRequireDefault(_neuralNetwork);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RNN = function () {
  function RNN() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, RNN);

    var defaults = this.constructor.defaults;

    Object.assign(this, defaults, options);
    this.trainOpts = {};
    this.updateTrainingOptions(Object.assign({}, this.constructor.trainDefaults, options));

    this.stepCache = {};
    this.runs = 0;
    this.ratioClipped = null;
    this.model = null;
    this.inputLookup = null;
    this.inputLookupLength = null;
    this.outputLookup = null;
    this.outputLookupLength = null;

    if (options.json) {
      this.fromJSON(options.json);
    }
  }

  _createClass(RNN, [{
    key: 'initialize',
    value: function initialize() {
      this.model = {
        input: null,
        hiddenLayers: [],
        output: null,
        equations: [],
        allMatrices: [],
        equationConnections: [],
        outputConnector: null
      };

      if (this.dataFormatter) {
        this.inputSize = this.inputRange = this.outputSize = this.dataFormatter.characters.length;
      }
      this.mapModel();
    }
  }, {
    key: 'createHiddenLayers',
    value: function createHiddenLayers() {
      //0 is end, so add 1 to offset
      this.model.hiddenLayers.push(this.getModel(this.hiddenLayers[0], this.inputSize));
      var prevSize = this.hiddenLayers[0];

      for (var d = 1; d < this.hiddenLayers.length; d++) {
        // loop over depths
        var hiddenSize = this.hiddenLayers[d];
        this.model.hiddenLayers.push(this.getModel(hiddenSize, prevSize));
        prevSize = hiddenSize;
      }
    }

    /**
     *
     * @param {Number} hiddenSize
     * @param {Number} prevSize
     * @returns {object}
     */

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
     * @param {Matrix} previousResult
     * @param {Object} hiddenLayer
     * @returns {Matrix}
     */

  }, {
    key: 'getEquation',
    value: function getEquation(equation, inputMatrix, previousResult, hiddenLayer) {
      var relu = equation.relu.bind(equation);
      var add = equation.add.bind(equation);
      var multiply = equation.multiply.bind(equation);

      return relu(add(add(multiply(hiddenLayer.weight, inputMatrix), multiply(hiddenLayer.transition, previousResult)), hiddenLayer.bias));
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
      var lastHiddenSize = this.hiddenLayers[this.hiddenLayers.length - 1];

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
      var equation = new _equation2.default();
      var outputs = [];
      var equationConnection = model.equationConnections.length > 0 ? model.equationConnections[model.equationConnections.length - 1] : this.initialLayerInputs;

      // 0 index
      var output = this.getEquation(equation, equation.inputMatrixToRow(model.input), equationConnection[0], model.hiddenLayers[0]);
      outputs.push(output);
      // 1+ indices
      for (var i = 1, max = this.hiddenLayers.length; i < max; i++) {
        output = this.getEquation(equation, output, equationConnection[i], model.hiddenLayers[i]);
        outputs.push(output);
      }

      model.equationConnections.push(outputs);
      equation.add(equation.multiply(model.outputConnector, output), model.output);
      model.equations.push(equation);
    }
  }, {
    key: 'mapModel',
    value: function mapModel() {
      var model = this.model;
      var hiddenLayers = model.hiddenLayers;
      var allMatrices = model.allMatrices;
      this.initialLayerInputs = this.hiddenLayers.map(function (size) {
        return new _matrix2.default(size, 1);
      });

      this.createInputMatrix();
      if (!model.input) throw new Error('net.model.input not set');
      allMatrices.push(model.input);

      this.createHiddenLayers();
      if (!model.hiddenLayers.length) throw new Error('net.hiddenLayers not set');
      for (var i = 0, max = hiddenLayers.length; i < max; i++) {
        var hiddenMatrix = hiddenLayers[i];
        for (var property in hiddenMatrix) {
          if (!hiddenMatrix.hasOwnProperty(property)) continue;
          allMatrices.push(hiddenMatrix[property]);
        }
      }

      this.createOutputMatrix();
      if (!model.outputConnector) throw new Error('net.model.outputConnector not set');
      if (!model.output) throw new Error('net.model.output not set');

      allMatrices.push(model.outputConnector);
      allMatrices.push(model.output);
    }

    /**
     *
     * @param {Number[]|string[]|string} input
     * @param {boolean} [logErrorRate]
     * @returns {number}
     */

  }, {
    key: 'trainPattern',
    value: function trainPattern(input, logErrorRate) {
      var error = this.trainInput(input);
      this.backpropagate(input);
      this.adjustWeights();

      if (logErrorRate) {
        return error;
      }
    }

    /**
     *
     * @param {Number[]} input
     * @returns {number}
     */

  }, {
    key: 'trainInput',
    value: function trainInput(input) {
      this.runs++;
      var model = this.model;
      var max = input.length;
      var log2ppl = 0;
      var equation = void 0;
      while (model.equations.length <= input.length + 1) {
        //last is zero
        this.bindEquation();
      }
      for (var inputIndex = -1, inputMax = input.length; inputIndex < inputMax; inputIndex++) {
        // start and end tokens are zeros
        var equationIndex = inputIndex + 1;
        equation = model.equations[equationIndex];

        var source = inputIndex === -1 ? 0 : input[inputIndex] + 1; // first step: start with START token
        var target = inputIndex === max - 1 ? 0 : input[inputIndex + 1] + 1; // last step: end with END token
        log2ppl += equation.predictTargetIndex(source, target);
      }
      return Math.pow(2, log2ppl / (max - 1)) / 100;
    }

    /**
     * @param {Number[]} input
     */

  }, {
    key: 'backpropagate',
    value: function backpropagate(input) {
      var i = input.length;
      var model = this.model;
      var equations = model.equations;
      while (i > 0) {
        equations[i].backpropagateIndex(input[i - 1] + 1);
        i--;
      }
      equations[0].backpropagateIndex(0);
    }
  }, {
    key: 'adjustWeights',
    value: function adjustWeights() {
      var regc = this.regc,
          clipval = this.clipval,
          model = this.model,
          decayRate = this.decayRate,
          stepCache = this.stepCache,
          smoothEps = this.smoothEps,
          trainOpts = this.trainOpts;
      var learningRate = trainOpts.learningRate;
      var allMatrices = model.allMatrices;

      var numClipped = 0;
      var numTot = 0;
      for (var matrixIndex = 0; matrixIndex < allMatrices.length; matrixIndex++) {
        var matrix = allMatrices[matrixIndex];
        var weights = matrix.weights,
            deltas = matrix.deltas;

        if (!(matrixIndex in stepCache)) {
          stepCache[matrixIndex] = (0, _zeros2.default)(matrix.rows * matrix.columns);
        }
        var cache = stepCache[matrixIndex];
        for (var i = 0; i < weights.length; i++) {
          var r = deltas[i];
          var w = weights[i];
          // rmsprop adaptive learning rate
          cache[i] = cache[i] * decayRate + (1 - decayRate) * r * r;
          // gradient clip
          if (r > clipval) {
            r = clipval;
            numClipped++;
          }
          if (r < -clipval) {
            r = -clipval;
            numClipped++;
          }
          numTot++;
          // update (and regularize)
          weights[i] = w + -learningRate * r / Math.sqrt(cache[i] + smoothEps) - regc * w;
        }
      }
      this.ratioClipped = numClipped / numTot;
    }

    /**
     *
     * @returns boolean
     */

  }, {
    key: 'run',


    /**
     *
     * @param {Number[]|*} [rawInput]
     * @param {Boolean} [isSampleI]
     * @param {Number} temperature
     * @returns {*}
     */
    value: function run() {
      var rawInput = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var isSampleI = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var temperature = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      var maxPredictionLength = this.maxPredictionLength + rawInput.length + (this.dataFormatter ? this.dataFormatter.specialIndexes.length : 0);
      if (!this.isRunnable) return null;
      var input = this.formatDataIn(rawInput);
      var model = this.model;
      var output = [];
      var i = 0;
      while (true) {
        var previousIndex = i === 0 ? 0 : i < input.length ? input[i - 1] + 1 : output[i - 1];
        while (model.equations.length <= i) {
          this.bindEquation();
        }
        var equation = model.equations[i];
        // sample predicted letter
        var outputMatrix = equation.runIndex(previousIndex);
        var logProbabilities = new _matrix2.default(model.output.rows, model.output.columns);
        (0, _copy2.default)(logProbabilities, outputMatrix);
        if (temperature !== 1 && isSampleI) {
          /**
           * scale log probabilities by temperature and re-normalize
           * if temperature is high, logProbabilities will go towards zero
           * and the softmax outputs will be more diffuse. if temperature is
           * very low, the softmax outputs will be more peaky
           */
          for (var j = 0, max = logProbabilities.weights.length; j < max; j++) {
            logProbabilities.weights[j] /= temperature;
          }
        }

        var probs = (0, _softmax2.default)(logProbabilities);
        var nextIndex = isSampleI ? (0, _sampleI2.default)(probs) : (0, _maxI2.default)(probs);

        i++;
        if (nextIndex === 0) {
          // END token predicted, break out
          break;
        }
        if (i >= maxPredictionLength) {
          // something is wrong
          break;
        }

        output.push(nextIndex);
      }

      /**
       * we slice the input length here, not because output contains it, but it will be erroneous as we are sending the
       * network what is contained in input, so the data is essentially guessed by the network what could be next, till it
       * locks in on a value.
       * Kind of like this, values are from input:
       * 0 -> 4 (or in English: "beginning on input" -> "I have no idea? I'll guess what they want next!")
       * 2 -> 2 (oh how interesting, I've narrowed down values...)
       * 1 -> 9 (oh how interesting, I've now know what the values are...)
       * then the output looks like: [4, 2, 9,...]
       * so we then remove the erroneous data to get our true output
       */
      return this.formatDataOut(input, output.slice(input.length).map(function (value) {
        return value - 1;
      }));
    }

    /**
     *
     * @param data
     * Verifies network sizes are initilaized
     * If they are not it will initialize them based off the data set.
     */

  }, {
    key: 'verifyIsInitialized',
    value: function verifyIsInitialized(data) {
      if (!this.model) {
        this.initialize();
      }
    }

    /**
     *
     * @param options
     *    Supports all `trainDefaults` properties
     *    also supports:
     *       learningRate: (number),
     *       momentum: (number),
     *       activation: 'sigmoid', 'relu', 'leaky-relu', 'tanh'
     */

  }, {
    key: 'updateTrainingOptions',
    value: function updateTrainingOptions(options) {
      var _this = this;

      Object.keys(this.constructor.trainDefaults).forEach(function (p) {
        return _this.trainOpts[p] = options.hasOwnProperty(p) ? options[p] : _this.trainOpts[p];
      });
      this.validateTrainingOptions(this.trainOpts);
      this.setLogMethod(options.log || this.trainOpts.log);
      this.activation = options.activation || this.activation;
    }
  }, {
    key: 'validateTrainingOptions',
    value: function validateTrainingOptions(options) {
      _neuralNetwork2.default.prototype.validateTrainingOptions.call(this, options);
    }

    /**
     *
     * @param log
     * if a method is passed in method is used
     * if false passed in nothing is logged
     * @returns error
     */

  }, {
    key: 'setLogMethod',
    value: function setLogMethod(log) {
      if (typeof log === 'function') {
        this.trainOpts.log = log;
      } else if (log) {
        this.trainOpts.log = console.log;
      } else {
        this.trainOpts.log = false;
      }
    }

    /**
     *
     * @param data
     * @param options
     * @protected
     * @return {object} { data, status, endTime }
     */

  }, {
    key: 'prepTraining',
    value: function prepTraining(data, options) {
      this.updateTrainingOptions(options);
      data = this.formatData(data);
      var endTime = Date.now() + this.trainOpts.timeout;

      var status = {
        error: 1,
        iterations: 0
      };

      this.verifyIsInitialized(data);

      return {
        data: data,
        status: status,
        endTime: endTime
      };
    }

    /**
     *
     * @param {Object[]|String[]} data an array of objects: `{input: 'string', output: 'string'}` or an array of strings
     * @param {Object} [options]
     * @returns {{error: number, iterations: number}}
     */

  }, {
    key: 'train',
    value: function train(data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this.trainOpts = options = Object.assign({}, this.constructor.trainDefaults, options);
      var iterations = options.iterations;
      var errorThresh = options.errorThresh;
      var log = options.log === true ? console.log : options.log;
      var logPeriod = options.logPeriod;
      var callback = options.callback;
      var callbackPeriod = options.callbackPeriod;
      var error = Infinity;
      var i = void 0;

      if (this.hasOwnProperty('setupData')) {
        data = this.setupData(data);
      }

      this.verifyIsInitialized();

      for (i = 0; i < iterations && error > errorThresh; i++) {
        var sum = 0;
        for (var j = 0; j < data.length; j++) {
          var err = this.trainPattern(data[j], true);
          sum += err;
        }
        error = sum / data.length;

        if (isNaN(error)) throw new Error('network error rate is unexpected NaN, check network configurations and try again');
        if (log && i % logPeriod === 0) {
          log('iterations: ' + i + ', training error: ' + error);
        }
        if (callback && i % callbackPeriod === 0) {
          callback({ error: error, iterations: i });
        }
      }

      return {
        error: error,
        iterations: i
      };
    }
  }, {
    key: 'addFormat',
    value: function addFormat() {
      throw new Error('not yet implemented');
    }

    /**
     *
     * @returns {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var defaults = this.constructor.defaults;
      if (!this.model) {
        this.initialize();
      }
      var model = this.model;
      var options = {};
      for (var p in defaults) {
        if (defaults.hasOwnProperty(p)) {
          options[p] = this[p];
        }
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
      var defaults = this.constructor.defaults;
      var options = json.options;
      this.model = null;
      this.hiddenLayers = null;
      var allMatrices = [];
      var input = _matrix2.default.fromJSON(json.input);
      allMatrices.push(input);
      var hiddenLayers = [];

      // backward compatibility for hiddenSizes
      (json.hiddenLayers || json.hiddenSizes).forEach(function (hiddenLayer) {
        var layers = {};
        for (var p in hiddenLayer) {
          layers[p] = _matrix2.default.fromJSON(hiddenLayer[p]);
          allMatrices.push(layers[p]);
        }
        hiddenLayers.push(layers);
      });

      var outputConnector = _matrix2.default.fromJSON(json.outputConnector);
      allMatrices.push(outputConnector);
      var output = _matrix2.default.fromJSON(json.output);
      allMatrices.push(output);

      Object.assign(this, defaults, options);

      // backward compatibility
      if (options.hiddenSizes) {
        this.hiddenLayers = options.hiddenSizes;
      }

      if (options.dataFormatter) {
        this.dataFormatter = _dataFormatter2.default.fromJSON(options.dataFormatter);
      }

      this.model = {
        input: input,
        hiddenLayers: hiddenLayers,
        output: output,
        allMatrices: allMatrices,
        outputConnector: outputConnector,
        equations: [],
        equationConnections: []
      };
      this.initialLayerInputs = this.hiddenLayers.map(function (size) {
        return new _matrix2.default(size, 1);
      });
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
      var equations = this.model.equations;
      var equation = equations[1];
      var states = equation.states;
      var jsonString = JSON.stringify(this.toJSON());

      function matrixOrigin(m, stateIndex) {
        for (var i = 0, max = states.length; i < max; i++) {
          var state = states[i];

          if (i === stateIndex) {
            var j = previousConnectionIndex(m);
            switch (m) {
              case state.left:
                if (j > -1) {
                  return 'typeof prevStates[' + j + '] === \'object\' ? prevStates[' + j + '].product : new Matrix(' + m.rows + ', ' + m.columns + ')';
                }
              case state.right:
                if (j > -1) {
                  return 'typeof prevStates[' + j + '] === \'object\' ? prevStates[' + j + '].product : new Matrix(' + m.rows + ', ' + m.columns + ')';
                }
              case state.product:
                return 'new Matrix(' + m.rows + ', ' + m.columns + ')';
              default:
                throw Error('unknown state');
            }
          }

          if (m === state.product) return 'states[' + i + '].product';
          if (m === state.right) return 'states[' + i + '].right';
          if (m === state.left) return 'states[' + i + '].left';
        }
      }

      function previousConnectionIndex(m) {
        var connection = model.equationConnections[0];
        var states = equations[0].states;
        for (var i = 0, max = states.length; i < max; i++) {
          if (states[i].product === m) {
            return i;
          }
        }
        return connection.indexOf(m);
      }

      function matrixToString(m, stateIndex) {
        if (!m || !m.rows || !m.columns) return 'null';

        if (m === model.input) return 'json.input';
        if (m === model.outputConnector) return 'json.outputConnector';
        if (m === model.output) return 'json.output';

        for (var i = 0, max = model.hiddenLayers.length; i < max; i++) {
          var hiddenLayer = model.hiddenLayers[i];
          for (var p in hiddenLayer) {
            if (!hiddenLayer.hasOwnProperty(p)) continue;
            if (hiddenLayer[p] !== m) continue;
            return 'json.hiddenLayers[' + i + '].' + p;
          }
        }

        return matrixOrigin(m, stateIndex);
      }

      function toInner(fnString) {
        // crude, but should be sufficient for now
        // function() { body }
        fnString = fnString.toString().split('{');
        fnString.shift();
        // body }
        fnString = fnString.join('{');
        fnString = fnString.split('}');
        fnString.pop();
        // body
        return fnString.join('}').split('\n').join('\n        ').replace('product.deltas[i] = 0;', '').replace('product.deltas[column] = 0;', '').replace('left.deltas[leftIndex] = 0;', '').replace('right.deltas[rightIndex] = 0;', '').replace('product.deltas = left.deltas.slice(0);', '');
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
        statesRaw.push('states[' + i + '] = {\n      name: \'' + state.forwardFn.name + '\',\n      left: ' + matrixToString(state.left, i) + ',\n      right: ' + matrixToString(state.right, i) + ',\n      product: ' + matrixToString(state.product, i) + '\n    }');

        var fnName = state.forwardFn.name;
        if (!usedFunctionNames[fnName]) {
          usedFunctionNames[fnName] = true;
          innerFunctionsSwitch.push('        case \'' + fnName + '\': //compiled from ' + fileName(fnName) + '\n          ' + toInner(state.forwardFn.toString()) + '\n          break;');
        }
      }

      var src = '\n  if (typeof rawInput === \'undefined\') rawInput = [];\n  if (typeof isSampleI === \'undefined\') isSampleI = false;\n  if (typeof temperature === \'undefined\') temperature = 1;\n  ' + (this.dataFormatter ? this.dataFormatter.toFunctionString() : '') + '\n  \n  var input = ' + (this.dataFormatter && typeof this.formatDataIn === 'function' ? 'formatDataIn(rawInput)' : 'rawInput') + ';\n  var json = ' + jsonString + ';\n  var maxPredictionLength = input.length + ' + this.maxPredictionLength + ';\n  var _i = 0;\n  var output = [];\n  var states = [];\n  var prevStates;\n  while (true) {\n    var previousIndex = (_i === 0\n        ? 0\n        : _i < input.length\n          ? input[_i - 1] + 1\n          : output[_i - 1])\n          ;\n    var rowPluckIndex = previousIndex;\n    var state;\n    prevStates = states;\n    states = [];\n    ' + statesRaw.join(';\n    ') + ';\n    for (var stateIndex = 0, stateMax = ' + statesRaw.length + '; stateIndex < stateMax; stateIndex++) {\n      state = states[stateIndex];\n      var product = state.product;\n      var left = state.left;\n      var right = state.right;\n      \n      switch (state.name) {\n' + innerFunctionsSwitch.join('\n') + '\n      }\n    }\n    \n    var logProbabilities = state.product;\n    if (temperature !== 1 && isSampleI) {\n      for (var q = 0, nq = logProbabilities.weights.length; q < nq; q++) {\n        logProbabilities.weights[q] /= temperature;\n      }\n    }\n\n    var probs = softmax(logProbabilities);\n    var nextIndex = isSampleI ? sampleI(probs) : maxI(probs);\n    \n    _i++;\n    if (nextIndex === 0) {\n      break;\n    }\n    if (_i >= maxPredictionLength) {\n      break;\n    }\n\n    output.push(nextIndex);\n  }\n  ' + (this.dataFormatter && typeof this.formatDataOut === 'function' ? 'return formatDataOut(input, output.slice(input.length).map(function(value) { return value - 1; }))' : 'return output.slice(input.length).map(function(value) { return value - 1; })') + ';\n  function Matrix(rows, columns) {\n    this.rows = rows;\n    this.columns = columns;\n    this.weights = zeros(rows * columns);\n  }\n  ' + (this.dataFormatter && typeof this.formatDataIn === 'function' ? 'function formatDataIn(input, output) { ' + toInner(this.formatDataIn.toString()).replace(/this[.]dataFormatter[\n\s]+[.]/g, '').replace(/this[.]dataFormatter[.]/g, '').replace(/this[.]dataFormatter/g, 'true') + ' }' : '') + '\n  ' + (this.dataFormatter !== null && typeof this.formatDataOut === 'function' ? 'function formatDataOut(input, output) { ' + toInner(this.formatDataOut.toString()).replace(/this[.]dataFormatter[\n\s]+[.]/g, '').replace(/this[.]dataFormatter[.]/g, '').replace(/this[.]dataFormatter/g, 'true') + ' }' : '') + '\n  ' + _zeros2.default.toString() + '\n  ' + _softmax2.default.toString().replace('_2.default', 'Matrix') + '\n  ' + _random.randomF.toString() + '\n  ' + _sampleI2.default.toString() + '\n  ' + _maxI2.default.toString();
      return new Function('rawInput', 'isSampleI', 'temperature', src);
    }
  }, {
    key: 'isRunnable',
    get: function get() {
      if (this.model.equations.length === 0) {
        console.error('No equations bound, did you run train()?');
        return false;
      }

      return true;
    }
  }]);

  return RNN;
}();

exports.default = RNN;


RNN.defaults = {
  inputSize: 20,
  inputRange: 20,
  hiddenLayers: [20, 20],
  outputSize: 20,
  decayRate: 0.999,
  smoothEps: 1e-8,
  regc: 0.000001,
  clipval: 5,
  maxPredictionLength: 100,
  /**
   *
   * @param {*[]} data
   * @returns {Number[]}
   */
  setupData: function setupData(data) {
    if (typeof data[0] !== 'string' && !Array.isArray(data[0]) && (!data[0].hasOwnProperty('input') || !data[0].hasOwnProperty('output'))) {
      return data;
    }
    var values = [];
    var result = [];
    if (typeof data[0] === 'string' || Array.isArray(data[0])) {
      if (!this.dataFormatter) {
        for (var i = 0; i < data.length; i++) {
          values.push(data[i]);
        }
        this.dataFormatter = new _dataFormatter2.default(values);
      }
      for (var _i = 0, max = data.length; _i < max; _i++) {
        result.push(this.formatDataIn(data[_i]));
      }
    } else {
      if (!this.dataFormatter) {
        for (var _i2 = 0; _i2 < data.length; _i2++) {
          values.push(data[_i2].input);
          values.push(data[_i2].output);
        }
        this.dataFormatter = _dataFormatter2.default.fromArrayInputOutput(values);
        this.dataFormatter.addUnrecognized();
      }
      for (var _i3 = 0, _max = data.length; _i3 < _max; _i3++) {
        result.push(this.formatDataIn(data[_i3].input, data[_i3].output));
      }
    }
    return result;
  },
  /**
   *
   * @param {*[]} input
   * @param {*[]} output
   * @returns {Number[]}
   */
  formatDataIn: function formatDataIn(input) {
    var output = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    if (this.dataFormatter) {
      if (this.dataFormatter.indexTable.hasOwnProperty('stop-input')) {
        return this.dataFormatter.toIndexesInputOutput(input, output);
      } else {
        return this.dataFormatter.toIndexes(input);
      }
    }
    return input;
  },
  /**
   *
   * @param {Number[]} input
   * @param {Number[]} output
   * @returns {*}
   */
  formatDataOut: function formatDataOut(input, output) {
    if (this.dataFormatter) {
      return this.dataFormatter.toCharacters(output).join('');
    }
    return output;
  },
  dataFormatter: null
};

RNN.trainDefaults = {
  iterations: 20000,
  errorThresh: 0.005,
  log: false,
  logPeriod: 10,
  learningRate: 0.01,
  callback: null,
  callbackPeriod: 10
};
//# sourceMappingURL=rnn.js.map