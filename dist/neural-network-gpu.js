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

var _gpu = require('gpu.js');

var _gpu2 = _interopRequireDefault(_gpu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *
 * @param {object} options
 * @constructor
 */
var NeuralNetworkGPU = function () {
  function NeuralNetworkGPU() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, NeuralNetworkGPU);

    Object.assign(this, NeuralNetworkGPU.defaults, options);
    this.hiddenSizes = options.hiddenLayers;
    this.layers = null;
    this.sizes = null;
    this.outputLayer = null;
    this.biases = null; // weights for bias nodes
    this.weights = null;
    this.outputs = null;

    this.forwardPropagate = [];
    this.backwardPropagate = [];
    this.changesPropagate = [];
    this.weightsPropagate = [];
    this.biasesPropagate = [];
    this.weightsToFloat = [];
    this.megaKernel = [];
    // state for training
    this.deltas = null;
    this.changes = null; // for momentum
    this.errors = null;
    this.count = 0;
    this.error = 100;
    this.gpu = new _gpu2.default({ mode: 'gpu' });
  }

  /**
   *
   * @param {} sizes
   * @param {Boolean} keepNetworkIntact
   */


  _createClass(NeuralNetworkGPU, [{
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
      this.changes = []; // for momentum
      this.deltas = [];
      this.errors = [];

      for (var layer = 0; layer <= this.outputLayer; layer++) {
        var _size = this.sizes[layer];
        this.deltas[layer] = (0, _zeros2.default)(_size);
        this.errors[layer] = (0, _zeros2.default)(_size);
        if (!keepNetworkIntact) {
          this.outputs[layer] = (0, _zeros2.default)(_size);
        }

        if (layer > 0) {
          this.biases[layer] = (0, _randos2.default)(_size);

          if (!keepNetworkIntact) {
            this.weights[layer] = new Array(_size);
          }
          this.changes[layer] = new Array(_size);

          for (var node = 0; node < _size; node++) {
            var prevSize = this.sizes[layer - 1];
            if (!keepNetworkIntact) {
              this.weights[layer][node] = (0, _randos2.default)(prevSize);
            }
            this.changes[layer][node] = (0, _zeros2.default)(prevSize);
          }
        }
      }
      this.buildRunInput();
      this.buildCalculateDeltas();
      this.buildGetChanges();
      this.buildChangeBiases();
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

      var options = Object.assign({}, NeuralNetworkGPU.trainDefaults, _options);
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
      for (i = 0; i < 1 && error > errorThresh; i++) {
        this.count++;
        var sum = 0;
        for (var j = 0; j < data.length - 2; j++) {
          var err = this.trainPattern(data[j].input, data[j].output, learningRate);
          sum += err;
        }

        error = sum / data.length;

        if (log && i % 1 == 0) {
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

      // backward propagate
      this.calculateDeltas(target);
      this.getChanges(learningRate);
      this.changeBiases(learningRate);
      // if(this.count % 1 == 0){
      for (var i = 0; i < this.errors.length; i++) {
        this.errors[i] = this.errors[i].toArray ? this.errors[i].toArray(this.gpu) : this.errors[i];
      }
      var error = this.error = (0, _mse2.default)(this.errors[this.outputLayer]);
      return error;
      // }else{/
      // return this.error;
      // }
    }

    // weights: [Layer1 - undefined, Layer2 - [[0,0], [0,0], [0,0]], Layer3 - [[0,0,0]]];
    // changes: [Layer1 - undefined, Layer2 - [ [0,0], [0,0], [0,0] ], Layer3 - [[0,0,0]]];
    // biases:  [Layer1 - undefined, Layer2 - [0, 0, 0], Layer3 - [0]]
    // outputs: [Layer1 - [0,0], Layer2 - [0, 0, 0], Layer3 - [0]]
    // errors:  [Layer1 - [0,0], Layer2 - [0,0,0], Layer3 - [0] ];
    // deltas:  [Layer1 - [0,0], Layer2 - [0,0,0], Layer3 - [0] ];
    // sizes: [2, 3, 1];

  }, {
    key: 'buildRunInput',
    value: function buildRunInput() {
      function weightedSum(weights, biases, x, inputs) {
        var sum = biases[x];
        for (var k = 0; k < size; k++) {
          sum += weights[x][k] * inputs[k];
        }
        return 1 / (1 + Math.exp(-sum));
      }

      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var kernel = this.gpu.createKernelMap([weightedSum], function (weights, biases, inputs) {
          return weightedSum(weights, biases, this.thread.x, inputs);
        }, {
          constants: {
            size: this.sizes[layer - 1]
          }
        }).setDimensions([this.sizes[layer]]).setOutputToTexture(false);
        this.forwardPropagate[layer] = kernel;
      }
    }

    /**
     *
     * @param input
     * @returns {*}
     */

  }, {
    key: 'runInput',
    value: function runInput(input) {
      var output = void 0;
      this.outputs[0] = input;
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        this.outputs[layer] = this.forwardPropagate[layer](this.weights[layer], this.biases[layer], input).result;
        output = input = this.outputs[layer];
      }
      return output;
    }
  }, {
    key: 'buildCalculateDeltas',
    value: function buildCalculateDeltas(target) {

      function calcError(outputs, target) {
        return target[this.thread.x] - outputs[this.thread.x];
      }

      function calcDeltas(error, output) {
        return error * output * (1 - output);
      }

      function calcErrorOutput(nextWeights, nextDeltas) {
        var error = 0;
        for (var k = 0; k < size; k++) {
          error += nextDeltas[k] * nextWeights[k][this.thread.x];
        }
        return error;
      }

      for (var layer = this.outputLayer; layer > 0; layer--) {
        if (layer == this.outputLayer) {
          var kernel = this.gpu.createKernelMap({
            error: calcError,
            deltas: calcDeltas
          }, function (outputs, target) {
            var output = outputs[this.thread.x];
            return calcDeltas(calcError(outputs, target), output);
          }).setDimensions([this.sizes[layer]]).setOutputToTexture(false);

          this.backwardPropagate[layer] = kernel;
        } else {
          var _kernel = this.gpu.createKernelMap({
            error: calcErrorOutput,
            deltas: _gpu2.default.alias('delt', calcDeltas)
          }, function (nextWeights, outputs, nextDeltas) {
            var output = outputs[this.thread.x];
            return delt(calcErrorOutput(nextWeights, nextDeltas), output);
          }, {
            constants: {
              size: this.deltas[layer + 1].length
            }
          }).setDimensions([this.sizes[layer]]).setOutputToTexture(false);

          this.backwardPropagate[layer] = _kernel;
        }
      }
    }
  }, {
    key: 'calculateDeltas',
    value: function calculateDeltas(target, learningRate) {
      for (var layer = this.outputLayer; layer > 0; layer--) {
        var output = void 0;
        if (layer == this.outputLayer) {
          output = this.backwardPropagate[layer](this.outputs[layer], target);
        } else {
          output = this.backwardPropagate[layer](this.weights[layer + 1], this.outputs[layer], this.deltas[layer + 1]);
        }

        this.errors[layer] = output.error.toArray ? output.error.toArray(this.gpu) : output.error;
        console.log(this.errors[layer], 'errors');
        this.deltas[layer] = output.result;
        console.log(this.deltas[layer], 'deltas');
      }
    }
  }, {
    key: 'buildGetChanges',
    value: function buildGetChanges() {
      function calcChanges(previousChange, deltas, previousOutputs, learningRate, momentum, x, y) {
        var sum = learningRate * deltas * previousOutputs[x];
        // sum += (momentum * previousChange[y][x]);

        for (var i = 0; i < size; i++) {
          sum += momentum * previousChange[y][i];
        }

        return sum;
      }

      function addWeights(change, weights, x, y) {
        return change + weights[y][x];
      }

      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var kernel = this.gpu.createKernelMap({ addWeights: addWeights, calcChanges: calcChanges }, function (previousOutputs, deltas, weights, changes, learningRate, momentum) {
          var delta = deltas[this.thread.y];
          var change = calcChanges(changes, delta, previousOutputs, learningRate, momentum, this.thread.x, this.thread.y);

          return addWeights(change, weights, this.thread.x, this.thread.y);
        }, {
          constants: {
            size: this.outputs[layer - 1].length
          }
        }).setDimensions([this.sizes[layer - 1], this.sizes[layer]]).setOutputToTexture(false
        // .setDebug(true);

        );this.changesPropagate[layer] = kernel;
      }
    }
  }, {
    key: 'getChanges',
    value: function getChanges(learningRate) {
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var output = this.changesPropagate[layer](this.outputs[layer - 1], this.deltas[layer], this.weights[layer], this.changes[layer], learningRate, this.momentum);

        this.changes[layer] = output.calcChanges.toArray ? output.calcChanges.toArray(this.gpu) : output.calcChanges;
        console.log(this.changes[layer][0], 'changes');
        this.weights[layer] = output.result;
        console.log(this.weights[layer][0], 'weights');
      }
    }
  }, {
    key: 'buildChangeBiases',
    value: function buildChangeBiases() {
      function addBiases(biases, deltas, learningRate, x) {
        return biases[x] + deltas[x] * learningRate;
      }
      for (var layer = 1; layer <= this.outputLayer; layer++) {

        var kernel = this.gpu.createKernelMap({
          addBiases: addBiases
        }, function (biases, deltas, learningRate) {
          return addBiases(biases, deltas, learningRate, this.thread.x);
        }).setDimensions([this.sizes[layer]]).setOutputToTexture(false);

        this.biasesPropagate[layer] = kernel;
      }
    }
  }, {
    key: 'changeBiases',
    value: function changeBiases(learningRate) {
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var output = this.biasesPropagate[layer](this.biases[layer], this.deltas[layer], learningRate);
        this.biases[layer] = output.result;
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
  }]);

  return NeuralNetworkGPU;
}();

exports.default = NeuralNetworkGPU;


NeuralNetworkGPU.trainDefaults = {
  iterations: 20000,
  errorThresh: 0.005,
  log: false,
  logPeriod: 10,
  learningRate: 0.3,
  callback: null,
  callbackPeriod: 10,
  keepNetworkIntact: false
};

NeuralNetworkGPU.defaults = {
  learningRate: 0.3,
  momentum: 0.1,
  binaryThresh: 0.5,
  hiddenLayers: null
};
//# sourceMappingURL=neural-network-gpu.js.map