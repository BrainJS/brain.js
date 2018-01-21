'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lookup = require('./lookup');

var _lookup2 = _interopRequireDefault(_lookup);

var _trainStream = require('./train-stream');

var _trainStream2 = _interopRequireDefault(_trainStream);

var _max = require('./utilities/max');

var _max2 = _interopRequireDefault(_max);

var _mse = require('./utilities/mse');

var _mse2 = _interopRequireDefault(_mse);

var _randos = require('./utilities/randos');

var _randos2 = _interopRequireDefault(_randos);

var _range = require('./utilities/range');

var _range2 = _interopRequireDefault(_range);

var _toArray = require('./utilities/to-array');

var _toArray2 = _interopRequireDefault(_toArray);

var _zeros = require('./utilities/zeros');

var _zeros2 = _interopRequireDefault(_zeros);

var _thaw = require('thaw.js');

var _thaw2 = _interopRequireDefault(_thaw);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @param {object} options
 * @constructor
 */
var NeuralNetwork = function () {
  _createClass(NeuralNetwork, null, [{
    key: 'trainDefaults',
    get: function get() {
      return {
        iterations: 20000,
        errorThresh: 0.005,
        log: false,
        logPeriod: 10,
        learningRate: 0.3,
        callback: null,
        callbackPeriod: 10,
        trainTimeMs: -Infinity
      };
    }
  }, {
    key: 'defaults',
    get: function get() {
      return {
        learningRate: 0.3,
        momentum: 0.1,
        binaryThresh: 0.5,
        hiddenLayers: null,
        activation: 'sigmoid'
      };
    }
  }]);

  function NeuralNetwork() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, NeuralNetwork);

    Object.assign(this, this.constructor.defaults, options);
    this.hiddenSizes = options.hiddenLayers;

    this.sizes = null;
    this.outputLayer = null;
    this.biases = null; // weights for bias nodes
    this.weights = null;
    this.outputs = null;

    // state for training
    this.deltas = null;
    this.changes = null; // for momentum
    this.errors = null;

    if (!this.constructor.prototype.hasOwnProperty('runInput')) {
      this.runInput = null;
    }
    if (!this.constructor.prototype.hasOwnProperty('calculateDeltas')) {
      this.calculateDeltas = null;
    }
  }

  /**
   *
   * @param {Number[]} sizes
   */


  _createClass(NeuralNetwork, [{
    key: 'initialize',
    value: function initialize(sizes) {
      this.sizes = sizes;
      this.outputLayer = this.sizes.length - 1;
      this.biases = []; // weights for bias nodes
      this.weights = [];
      this.outputs = [];

      // state for training
      this.deltas = [];
      this.changes = []; // for momentum
      this.errors = [];

      for (var layer = 0; layer <= this.outputLayer; layer++) {
        var size = this.sizes[layer];
        this.deltas[layer] = (0, _zeros2.default)(size);
        this.errors[layer] = (0, _zeros2.default)(size);
        this.outputs[layer] = (0, _zeros2.default)(size);

        if (layer > 0) {
          this.biases[layer] = (0, _randos2.default)(size);
          this.weights[layer] = new Array(size);
          this.changes[layer] = new Array(size);

          for (var node = 0; node < size; node++) {
            var prevSize = this.sizes[layer - 1];
            this.weights[layer][node] = (0, _randos2.default)(prevSize);
            this.changes[layer][node] = (0, _zeros2.default)(prevSize);
          }
        }
      }

      this.setActivation();
    }
  }, {
    key: 'setActivation',
    value: function setActivation() {
      switch (this.activation) {
        case 'sigmoid':
          this.runInput = this.runInput || this.runInputSigmoid;
          this.calculateDeltas = this.calculateDeltas || this.calculateDeltasSigmoid;
          break;
        case 'relu':
          this.runInput = this.runInput || this.runInputRelu;
          this.calculateDeltas = this.calculateDeltas || this.calculateDeltasRelu;
          break;
        case 'leaky-relu':
          this.runInput = this.runInput || this.runInputLeakyRelu;
          this.calculateDeltas = this.calculateDeltas || this.calculateDeltasLeakyRelu;
          break;
        case 'tanh':
          this.runInput = this.runInput || this.runInputTanh;
          this.calculateDeltas = this.calculateDeltas || this.calculateDeltasTanh;
          break;
        default:
          throw new Error('unknown activation ' + this.activation);
      }
    }

    /**
     *
     * @param input
     * @returns {*}
     */

  }, {
    key: 'run',
    value: function run(input) {
      if (this.inputLookup) {
        input = _lookup2.default.toArray(this.inputLookup, input);
      }

      var output = [].concat(_toConsumableArray(this.runInput(input)));

      if (this.outputLookup) {
        output = _lookup2.default.toHash(this.outputLookup, output);
      }
      return output;
    }

    /**
     * trains via sigmoid
     * @param input
     * @returns {*}
     */

  }, {
    key: 'runInputSigmoid',
    value: function runInputSigmoid(input) {
      this.outputs[0] = input; // set output state of input layer

      var output = null;
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        for (var node = 0; node < this.sizes[layer]; node++) {
          var weights = this.weights[layer][node];

          var sum = this.biases[layer][node];
          for (var k = 0; k < weights.length; k++) {
            sum += weights[k] * input[k];
          }
          //sigmoid
          this.outputs[layer][node] = 1 / (1 + Math.exp(-sum));
        }
        output = input = this.outputs[layer];
      }
      return output;
    }
  }, {
    key: 'runInputRelu',
    value: function runInputRelu(input) {
      this.outputs[0] = input; // set output state of input layer

      var output = null;
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        for (var node = 0; node < this.sizes[layer]; node++) {
          var weights = this.weights[layer][node];

          var sum = this.biases[layer][node];
          for (var k = 0; k < weights.length; k++) {
            sum += weights[k] * input[k];
          }
          //relu
          this.outputs[layer][node] = sum < 0 ? 0 : sum;
        }
        output = input = this.outputs[layer];
      }
      return output;
    }
  }, {
    key: 'runInputLeakyRelu',
    value: function runInputLeakyRelu(input) {
      this.outputs[0] = input; // set output state of input layer

      var output = null;
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        for (var node = 0; node < this.sizes[layer]; node++) {
          var weights = this.weights[layer][node];

          var sum = this.biases[layer][node];
          for (var k = 0; k < weights.length; k++) {
            sum += weights[k] * input[k];
          }
          //leaky relu
          this.outputs[layer][node] = sum < 0 ? 0 : 0.01 * sum;
        }
        output = input = this.outputs[layer];
      }
      return output;
    }
  }, {
    key: 'runInputTanh',
    value: function runInputTanh(input) {
      this.outputs[0] = input; // set output state of input layer

      var output = null;
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        for (var node = 0; node < this.sizes[layer]; node++) {
          var weights = this.weights[layer][node];

          var sum = this.biases[layer][node];
          for (var k = 0; k < weights.length; k++) {
            sum += weights[k] * input[k];
          }
          //tanh
          this.outputs[layer][node] = Math.tanh(sum);
        }
        output = input = this.outputs[layer];
      }
      return output;
    }

    /**
     *
     * @param data
     * @returns sizes
     */

  }, {
    key: '_getSizesFromData',
    value: function _getSizesFromData(data) {
      var sizes = [];
      var inputSize = data[0].input.length;
      var outputSize = data[0].output.length;
      var hiddenSizes = this.hiddenSizes;
      if (!hiddenSizes) {
        sizes.push(Math.max(3, Math.floor(inputSize / 2)));
      } else {
        hiddenSizes.forEach(function (size) {
          sizes.push(size);
        });
      }

      sizes.unshift(inputSize);
      sizes.push(outputSize);
      return sizes;
    }

    /**
     *
     * @param data
     * @param learning Rate
     * @returns error
     */

  }, {
    key: '_calculateTrainingError',
    value: function _calculateTrainingError(data, learningRate) {
      var sum = 0;
      for (var i = 0; i < data.length; ++i) {
        sum += this.trainPattern(data[i].input, data[i].output, learningRate);
      }
      return sum / data.length;
    }

    /**
     *
     * @param status { iterations: number, error: number}
     * @param options
     */

  }, {
    key: '_checkTrainingTick',
    value: function _checkTrainingTick(data, status, options) {
      status.iterations++;
      status.error = this._calculateTrainingError(data, options.learningRate);

      if (options.log && status.iterations % options.logPeriod === 0) {
        console.log('iterations: ' + status.iterations + ', training error: ' + status.error);
      }

      if (options.callback && status.iterations % options.callbackPeriod === 0) {
        options.callback(Object.assign(status));
      }
    }

    /**
     *
     * @param data
     * @param _options
     * @returns {{error: number, iterations: number}}
     */

  }, {
    key: 'train',
    value: function train(data) {
      var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var options = Object.assign({}, this.constructor.trainDefaults, _options);
      data = this.formatData(data);
      options.learningRate = _options.learningRate || this.learningRate || options.learningRate;
      var endTime = Date.now() + options.trainTimeMs;
      var status = {
        error: 1,
        iterations: 0
      };

      if (this.sizes === null) {
        var sizes = this._getSizesFromData(data);
        this.initialize(sizes);
      }
      while (status.iterations < options.iterations && status.error > options.errorThresh && Date.now() > endTime) {
        this._checkTrainingTick(data, status, options);
      }
      return status;
    }

    /**
     *
     * @param data
     * @param _options
     * @param cb
     * @returns {{error: number, iterations: number}}
     */

  }, {
    key: 'trainAsync',
    value: function trainAsync(data) {
      var _this = this;

      var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return new Promise(function (resolve, reject) {
        var options = Object.assign({}, _this.constructor.trainDefaults, _options);
        data = _this.formatData(data);
        options.learningRate = _options.learningRate || _this.learningRate || options.learningRate;
        var endTime = Date.now() + options.trainTimeMs;

        var status = {
          error: 1,
          iterations: 0
        };

        if (_this.sizes === null) {
          var sizes = _this._getSizesFromData(data);
          _this.initialize(sizes);
        }

        var items = new Array(options.iterations);
        var thaw = new _thaw2.default(items, {
          delay: true,
          each: function each() {
            _this._checkTrainingTick(data, status, options);

            if (status.error < options.errorThresh || Date.now() < endTime) {
              thaw.stop();
            }
          },
          done: function done() {
            resolve(status);
          }
        });

        thaw.tick();
      });
    }

    /**
     *
     * @param input
     * @param target
     * @param learningRate
     */

  }, {
    key: 'trainPattern',
    value: function trainPattern(input, target, learningRate) {
      learningRate = learningRate || this.learningRate;

      // forward propagate
      this.runInput(input);

      // back propagate
      this.calculateDeltas(target);
      this.adjustWeights(learningRate);

      var error = (0, _mse2.default)(this.errors[this.outputLayer]);
      return error;
    }

    /**
     *
     * @param target
     */

  }, {
    key: 'calculateDeltasSigmoid',
    value: function calculateDeltasSigmoid(target) {
      for (var layer = this.outputLayer; layer >= 0; layer--) {
        for (var node = 0; node < this.sizes[layer]; node++) {
          var output = this.outputs[layer][node];

          var error = 0;
          if (layer === this.outputLayer) {
            error = target[node] - output;
          } else {
            var deltas = this.deltas[layer + 1];
            for (var k = 0; k < deltas.length; k++) {
              error += deltas[k] * this.weights[layer + 1][k][node];
            }
          }
          this.errors[layer][node] = error;
          this.deltas[layer][node] = error * output * (1 - output);
        }
      }
    }

    /**
     *
     * @param target
     */

  }, {
    key: 'calculateDeltasRelu',
    value: function calculateDeltasRelu(target) {
      for (var layer = this.outputLayer; layer >= 0; layer--) {
        for (var node = 0; node < this.sizes[layer]; node++) {
          var output = this.outputs[layer][node];

          var error = 0;
          if (layer === this.outputLayer) {
            error = target[node] - output;
          } else {
            var deltas = this.deltas[layer + 1];
            for (var k = 0; k < deltas.length; k++) {
              error += deltas[k] * this.weights[layer + 1][k][node];
            }
          }
          this.errors[layer][node] = error;
          this.deltas[layer][node] = output > 0 ? error : 0;
        }
      }
    }

    /**
     *
     * @param target
     */

  }, {
    key: 'calculateDeltasLeakyRelu',
    value: function calculateDeltasLeakyRelu(target) {
      for (var layer = this.outputLayer; layer >= 0; layer--) {
        for (var node = 0; node < this.sizes[layer]; node++) {
          var output = this.outputs[layer][node];

          var error = 0;
          if (layer === this.outputLayer) {
            error = target[node] - output;
          } else {
            var deltas = this.deltas[layer + 1];
            for (var k = 0; k < deltas.length; k++) {
              error += deltas[k] * this.weights[layer + 1][k][node];
            }
          }
          this.errors[layer][node] = error;
          this.deltas[layer][node] = output > 0 ? error : 0.01 * error;
        }
      }
    }

    /**
     *
     * @param target
     */

  }, {
    key: 'calculateDeltasTanh',
    value: function calculateDeltasTanh(target) {
      for (var layer = this.outputLayer; layer >= 0; layer--) {
        for (var node = 0; node < this.sizes[layer]; node++) {
          var output = this.outputs[layer][node];

          var error = 0;
          if (layer === this.outputLayer) {
            error = target[node] - output;
          } else {
            var deltas = this.deltas[layer + 1];
            for (var k = 0; k < deltas.length; k++) {
              error += deltas[k] * this.weights[layer + 1][k][node];
            }
          }
          this.errors[layer][node] = error;
          this.deltas[layer][node] = (1 - output * output) * error;
        }
      }
    }

    /**
     *
     * @param learningRate
     */

  }, {
    key: 'adjustWeights',
    value: function adjustWeights(learningRate) {
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var incoming = this.outputs[layer - 1];

        for (var node = 0; node < this.sizes[layer]; node++) {
          var delta = this.deltas[layer][node];

          for (var k = 0; k < incoming.length; k++) {
            var change = this.changes[layer][node][k];

            change = learningRate * delta * incoming[k] + this.momentum * change;

            this.changes[layer][node][k] = change;
            this.weights[layer][node][k] += change;
          }
          this.biases[layer][node] += learningRate * delta;
        }
      }
    }

    /**
     *
     * @param data
     * @returns {*}
     */

  }, {
    key: 'formatData',
    value: function formatData(data) {
      var _this2 = this;

      if (!Array.isArray(data)) {
        // turn stream datum into array
        var tmp = [];
        tmp.push(data);
        data = tmp;
      }
      // turn sparse hash input into arrays with 0s as filler
      var datum = data[0].input;
      if (!Array.isArray(datum) && !(datum instanceof Float32Array)) {
        if (!this.inputLookup) {
          this.inputLookup = _lookup2.default.buildLookup(data.map(function (value) {
            return value['input'];
          }));
        }
        data = data.map(function (datum) {
          var array = _lookup2.default.toArray(_this2.inputLookup, datum.input);
          return Object.assign({}, datum, { input: array });
        }, this);
      }

      if (!Array.isArray(data[0].output)) {
        if (!this.outputLookup) {
          this.outputLookup = _lookup2.default.buildLookup(data.map(function (value) {
            return value['output'];
          }));
        }
        data = data.map(function (datum) {
          var array = _lookup2.default.toArray(_this2.outputLookup, datum.output);
          return Object.assign({}, datum, { output: array });
        }, this);
      }
      return data;
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
      var _this3 = this;

      data = this.formatData(data);

      // for binary classification problems with one output node
      var isBinary = data[0].output.length === 1;
      var falsePos = 0;
      var falseNeg = 0;
      var truePos = 0;
      var trueNeg = 0;

      // for classification problems
      var misclasses = [];

      // run each pattern through the trained network and collect
      // error and misclassification statistics
      var sum = 0;

      var _loop = function _loop(i) {
        var output = _this3.runInput(data[i].input);
        var target = data[i].output;

        var actual = void 0,
            expected = void 0;
        if (isBinary) {
          actual = output[0] > _this3.binaryThresh ? 1 : 0;
          expected = target[0];
        } else {
          actual = output.indexOf((0, _max2.default)(output));
          expected = target.indexOf((0, _max2.default)(target));
        }

        if (actual !== expected) {
          var misclass = data[i];
          Object.assign(misclass, {
            actual: actual,
            expected: expected
          });
          misclasses.push(misclass);
        }

        if (isBinary) {
          if (actual === 0 && expected === 0) {
            trueNeg++;
          } else if (actual === 1 && expected === 1) {
            truePos++;
          } else if (actual === 0 && expected === 1) {
            falseNeg++;
          } else if (actual === 1 && expected === 0) {
            falsePos++;
          }
        }

        var errors = output.map(function (value, i) {
          return target[i] - value;
        });
        sum += (0, _mse2.default)(errors);
      };

      for (var i = 0; i < data.length; i++) {
        _loop(i);
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
    }

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

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var layers = [];
      for (var layer = 0; layer <= this.outputLayer; layer++) {
        layers[layer] = {};

        var nodes = void 0;
        // turn any internal arrays back into hashes for readable json
        if (layer === 0 && this.inputLookup) {
          nodes = Object.keys(this.inputLookup);
        } else if (layer === this.outputLayer && this.outputLookup) {
          nodes = Object.keys(this.outputLookup);
        } else {
          nodes = (0, _range2.default)(0, this.sizes[layer]);
        }

        for (var j = 0; j < nodes.length; j++) {
          var node = nodes[j];
          layers[layer][node] = {};

          if (layer > 0) {
            layers[layer][node].bias = this.biases[layer][j];
            layers[layer][node].weights = {};
            for (var k in layers[layer - 1]) {
              var index = k;
              if (layer === 1 && this.inputLookup) {
                index = this.inputLookup[k];
              }
              layers[layer][node].weights[k] = this.weights[layer][j][index];
            }
          }
        }
      }
      return {
        sizes: this.sizes,
        layers: layers,
        outputLookup: !!this.outputLookup,
        inputLookup: !!this.inputLookup,
        activation: this.activation
      };
    }

    /**
     *
     * @param json
     * @returns {NeuralNetwork}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(json) {
      this.initialize(json.sizes);

      for (var i = 0; i <= this.outputLayer; i++) {
        var layer = json.layers[i];
        if (i === 0 && (!layer[0] || json.inputLookup)) {
          this.inputLookup = _lookup2.default.lookupFromHash(layer);
        } else if (i === this.outputLayer && (!layer[0] || json.outputLookup)) {
          this.outputLookup = _lookup2.default.lookupFromHash(layer);
        }
        if (layer > 0) {
          var nodes = Object.keys(layer);
          this.sizes[i] = nodes.length;
          for (var j in nodes) {
            var node = nodes[j];
            this.biases[i] = layer[node].bias;
            this.weights[i][j] = (0, _toArray2.default)(layer[node].weights);
          }
        }
      }

      this.setActivation();
      return this;
    }

    /**
     *
     * @returns {Function}
     */

  }, {
    key: 'toFunction',
    value: function toFunction() {
      var activation = this.activation;
      function nodeHandle(layers, layerNumber, nodeKey) {
        if (layerNumber === 0) {
          return typeof nodeKey === 'string' ? 'input[\'' + nodeKey + '\']' : 'input[' + nodeKey + ']';
        }

        var layer = layers[layerNumber];
        var node = layer[nodeKey];
        var result = [node.bias];
        for (var w in node.weights) {
          if (node.weights[w] < 0) {
            result.push(node.weights[w] + '*(' + nodeHandle(layers, layerNumber - 1, w) + ')');
          } else {
            result.push('+' + node.weights[w] + '*(' + nodeHandle(layers, layerNumber - 1, w) + ')');
          }
        }

        switch (activation) {
          case 'sigmoid':
            return '1/(1+1/Math.exp(' + result.join('') + '))';
          case 'relu':
            return 'var sum = ' + result.join('') + ';(sum < 0 ? 0 : sum);';
          case 'leaky-relu':
            return 'var sum = ' + result.join('') + ';(sum < 0 ? 0 : 0.01 * sum);';
          case 'tanh':
            return 'Math.tanh(' + result.join('') + ');';
          default:
            throw new Error('unknown activation type ' + activation);
        }
      }

      var layers = this.toJSON().layers;
      var layersAsMath = [];
      var result = void 0;
      for (var i in layers[layers.length - 1]) {
        layersAsMath.push(nodeHandle(layers, layers.length - 1, i));
      }
      if (this.outputLookup) {
        result = '{' + Object.keys(this.outputLookup).map(function (key, i) {
          return '\'' + key + '\':' + layersAsMath[i];
        }) + '}';
      } else {
        result = '[' + layersAsMath.join(',') + ']';
      }
      return new Function('input', 'return ' + result);
    }

    /**
     * This will create a TrainStream (WriteStream) for us to send the training data to.
     * @param opts training options
     * @returns {TrainStream|*}
     */

  }, {
    key: 'createTrainStream',
    value: function createTrainStream(opts) {
      opts = opts || {};
      opts.neuralNetwork = this;
      this.setActivation();
      this.trainStream = new _trainStream2.default(opts);
      return this.trainStream;
    }
  }]);

  return NeuralNetwork;
}();

exports.default = NeuralNetwork;
//# sourceMappingURL=neural-network.js.map