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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *
 * @param {object} options
 * @constructor
 */
var NeuralNetwork = function () {
  function NeuralNetwork() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, NeuralNetwork);

    Object.assign(this, NeuralNetwork.defaults, options);
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
  }

  /**
   *
   * @param {} sizes
   * @param {Boolean} keepNetworkIntact
   */


  _createClass(NeuralNetwork, [{
    key: 'initialize',
    value: function initialize(sizes, keepNetworkIntact) {
      this.sizes = sizes;
      this.outputLayer = this.sizes.length - 1;

      if (!keepNetworkIntact) {
        this.biases = []; // weights for bias nodes
        this.weights = [];
        this.outputs = [];
      }

      // state for training
      this.deltas = [];
      this.changes = []; // for momentum
      this.errors = [];

      for (var layer = 0; layer <= this.outputLayer; layer++) {
        var size = this.sizes[layer];
        this.deltas[layer] = (0, _zeros2.default)(size);
        this.errors[layer] = (0, _zeros2.default)(size);
        if (!keepNetworkIntact) {
          this.outputs[layer] = (0, _zeros2.default)(size);
        }

        if (layer > 0) {
          this.biases[layer] = (0, _randos2.default)(size);
          if (!keepNetworkIntact) {
            this.weights[layer] = new Array(size);
          }
          this.changes[layer] = new Array(size);

          for (var node = 0; node < size; node++) {
            var prevSize = this.sizes[layer - 1];
            if (!keepNetworkIntact) {
              this.weights[layer][node] = (0, _randos2.default)(prevSize);
            }
            this.changes[layer][node] = (0, _zeros2.default)(prevSize);
          }
        }
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

      var output = this.runInput(input);

      if (this.outputLookup) {
        output = _lookup2.default.toHash(this.outputLookup, output);
      }
      return output;
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

  }, {
    key: 'train',
    value: function train(data) {
      var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var options = Object.assign({}, NeuralNetwork.trainDefaults, _options);
      data = this.formatData(data);
      var iterations = options.iterations;
      var errorThresh = options.errorThresh;
      var log = options.log === true ? console.log : options.log;
      var logPeriod = options.logPeriod;
      var learningRate = _options.learningRate || this.learningRate || options.learningRate;
      var callback = options.callback;
      var callbackPeriod = options.callbackPeriod;
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

      this.initialize(sizes, options.keepNetworkIntact);

      var error = 1;
      var i = void 0;
      for (i = 0; i < iterations && error > errorThresh; i++) {
        var sum = 0;
        for (var j = 0; j < data.length; j++) {
          var err = this.trainPattern(data[j].input, data[j].output, learningRate);
          sum += err;
        }
        error = sum / data.length;

        if (log && i % logPeriod == 0) {
          log('iterations:', i, 'training error:', error);
        }
        if (callback && i % callbackPeriod == 0) {
          callback({ error: error, iterations: i });
        }
      }

      return {
        error: error,
        iterations: i
      };
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
    key: 'calculateDeltas',
    value: function calculateDeltas(target) {
      for (var layer = this.outputLayer; layer >= 0; layer--) {
        for (var node = 0; node < this.sizes[layer]; node++) {
          var output = this.outputs[layer][node];

          var error = 0;
          if (layer == this.outputLayer) {
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
      var _this = this;

      if (data.constructor !== Array) {
        // turn stream datum into array
        var tmp = [];
        tmp.push(data);
        data = tmp;
      }
      // turn sparse hash input into arrays with 0s as filler
      var datum = data[0].input;
      if (datum.constructor !== Array && !(datum instanceof Float64Array)) {
        if (!this.inputLookup) {
          this.inputLookup = _lookup2.default.buildLookup(data.map(function (value) {
            return value['input'];
          }));
        }
        data = data.map(function (datum) {
          var array = _lookup2.default.toArray(_this.inputLookup, datum.input);
          return Object.assign({}, datum, { input: array });
        }, this);
      }

      if (data[0].output.constructor !== Array) {
        if (!this.outputLookup) {
          this.outputLookup = _lookup2.default.buildLookup(data.map(function (value) {
            return value['output'];
          }));
        }
        data = data.map(function (datum) {
          var array = _lookup2.default.toArray(_this.outputLookup, datum.output);
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
      var _this2 = this;

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

      var _loop = function _loop(i) {
        var output = _this2.runInput(data[i].input);
        var target = data[i].output;

        var actual = void 0,
            expected = void 0;
        if (isBinary) {
          actual = output[0] > _this2.binaryThresh ? 1 : 0;
          expected = target[0];
        } else {
          actual = output.indexOf((0, _max2.default)(output));
          expected = target.indexOf((0, _max2.default)(target));
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
          } else if (actual == 1 && expected == 1) {
            truePos++;
          } else if (actual == 0 && expected == 1) {
            falseNeg++;
          } else if (actual == 1 && expected == 0) {
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
        if (layer == 0 && this.inputLookup) {
          nodes = Object.keys(this.inputLookup);
        } else if (layer == this.outputLayer && this.outputLookup) {
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
              if (layer == 1 && this.inputLookup) {
                index = this.inputLookup[k];
              }
              layers[layer][node].weights[k] = this.weights[layer][j][index];
            }
          }
        }
      }
      return { layers: layers, outputLookup: !!this.outputLookup, inputLookup: !!this.inputLookup };
    }

    /**
     *
     * @param json
     * @returns {NeuralNetwork}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(json) {
      var size = json.layers.length;
      this.outputLayer = size - 1;

      this.sizes = new Array(size);
      this.weights = new Array(size);
      this.biases = new Array(size);
      this.outputs = new Array(size);

      for (var i = 0; i <= this.outputLayer; i++) {
        var layer = json.layers[i];
        if (i == 0 && (!layer[0] || json.inputLookup)) {
          this.inputLookup = _lookup2.default.lookupFromHash(layer);
        } else if (i == this.outputLayer && (!layer[0] || json.outputLookup)) {
          this.outputLookup = _lookup2.default.lookupFromHash(layer);
        }

        var nodes = Object.keys(layer);
        this.sizes[i] = nodes.length;
        this.weights[i] = [];
        this.biases[i] = [];
        this.outputs[i] = [];

        for (var j in nodes) {
          var node = nodes[j];
          this.biases[i][j] = layer[node].bias;
          this.weights[i][j] = (0, _toArray2.default)(layer[node].weights);
        }
      }
      return this;
    }

    /**
     *
     * @returns {Function}
     */

  }, {
    key: 'toFunction',
    value: function toFunction() {
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
        return '1/(1+1/Math.exp(' + result.join('') + '))';
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
      this.trainStream = new _trainStream2.default(opts);
      return this.trainStream;
    }
  }]);

  return NeuralNetwork;
}();

exports.default = NeuralNetwork;


NeuralNetwork.trainDefaults = {
  iterations: 20000,
  errorThresh: 0.005,
  log: false,
  logPeriod: 10,
  learningRate: 0.3,
  callback: null,
  callbackPeriod: 10,
  keepNetworkIntact: false
};

NeuralNetwork.defaults = {
  learningRate: 0.3,
  momentum: 0.1,
  binaryThresh: 0.5,
  hiddenLayers: null
};
//# sourceMappingURL=neural-network.js.map