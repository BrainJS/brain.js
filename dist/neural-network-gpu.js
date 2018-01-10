'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _neuralNetwork = require('./neural-network');

var _neuralNetwork2 = _interopRequireDefault(_neuralNetwork);

var _lookup = require('./lookup');

var _lookup2 = _interopRequireDefault(_lookup);

var _gpu = require('gpu.js');

var _gpu2 = _interopRequireDefault(_gpu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 *
 * @param {object} options
 * @constructor
 */
var NeuralNetworkGPU = function (_NeuralNetwork) {
  _inherits(NeuralNetworkGPU, _NeuralNetwork);

  function NeuralNetworkGPU() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, NeuralNetworkGPU);

    var _this = _possibleConstructorReturn(this, (NeuralNetworkGPU.__proto__ || Object.getPrototypeOf(NeuralNetworkGPU)).call(this, options));

    _this.forwardPropagate = [];
    _this.backwardPropagate = [];
    _this.changesPropagate = [];
    _this.biasesPropagate = [];
    _this.gpu = new _gpu2.default({ mode: options.mode });
    return _this;
  }

  /**
   *
   * @param {} sizes
   * @param {Boolean} keepNetworkIntact
   */


  _createClass(NeuralNetworkGPU, [{
    key: 'initialize',
    value: function initialize(sizes, keepNetworkIntact) {
      _get(NeuralNetworkGPU.prototype.__proto__ || Object.getPrototypeOf(NeuralNetworkGPU.prototype), 'initialize', this).call(this, sizes, keepNetworkIntact);
      this.buildRunInput();
      this.buildCalculateDeltas();
      this.buildGetChanges();
      this.buildChangeBiases();
      this.buildGetMSE();
    }
  }, {
    key: 'setActivation',
    value: function setActivation() {}

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

      return this.getMSE(this.errors[this.outputLayer])[0];
    }
  }, {
    key: 'buildRunInput',
    value: function buildRunInput() {
      var weightedSum = null;

      switch (this.activation) {
        case 'sigmoid':
          weightedSum = weightedSumSigmoid;
          break;
        case 'relu':
          weightedSum = weightedSumRelu;
          break;
        case 'leaky-relu':
          weightedSum = weightedSumLeakyRelu;
          break;
        case 'tanh':
          weightedSum = weightedSumTanh;
          break;
        default:
          throw new Error('unknown activation ' + this.activation);
      }

      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var kernel = this.gpu.createKernelMap({ weightedSum: _gpu2.default.alias('weightedSum', weightedSum) }, function (weights, biases, inputs) {
          return weightedSum(weights, biases, this.thread.x, inputs);
        }, {
          constants: {
            size: this.sizes[layer - 1]
          }
        }).setOutput([this.sizes[layer]]).setOutputToTexture(true);
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
    value: function buildCalculateDeltas() {
      var calcDeltas = null;

      switch (this.activation) {
        case 'sigmoid':
          calcDeltas = calcDeltasSigmoid;
          break;
        case 'relu':
          calcDeltas = calcDeltasRelu;
          break;
        case 'leaky-relu':
          calcDeltas = calcDeltasLeakyRelu;
          break;
        case 'tanh':
          calcDeltas = calcDeltasTanh;
          break;
        default:
          throw new Error('unknown activation ' + this.activation);
      }

      for (var layer = this.outputLayer; layer > 0; layer--) {
        if (layer === this.outputLayer) {
          var kernel = this.gpu.createKernelMap({
            error: _gpu2.default.alias('calcError', calcError),
            deltas: _gpu2.default.alias('calcDeltas', calcDeltas)
          }, function (outputs, target) {
            var output = outputs[this.thread.x];
            return calcDeltas(calcError(output, target), output);
          }).setOutput([this.sizes[layer]]).setOutputToTexture(true);

          this.backwardPropagate[layer] = kernel;
        } else {
          var _kernel = this.gpu.createKernelMap({
            error: _gpu2.default.alias('calcErrorOutput', calcErrorOutput),
            deltas: _gpu2.default.alias('calcDeltas', calcDeltas)
          }, function (nextWeights, outputs, nextDeltas) {
            var output = outputs[this.thread.x];
            return calcDeltas(calcErrorOutput(nextWeights, nextDeltas), output);
          }, {
            constants: {
              size: this.deltas[layer + 1].length
            }
          }).setOutput([this.sizes[layer]]).setOutputToTexture(true);

          this.backwardPropagate[layer] = _kernel;
        }
      }
    }
  }, {
    key: 'calculateDeltas',
    value: function calculateDeltas(target, learningRate) {
      for (var layer = this.outputLayer; layer > 0; layer--) {
        var output = void 0;
        if (layer === this.outputLayer) {
          output = this.backwardPropagate[layer](this.outputs[layer], target);
        } else {
          output = this.backwardPropagate[layer](this.weights[layer + 1], this.outputs[layer], this.deltas[layer + 1]);
        }

        this.deltas[layer] = output.result;
        this.errors[layer] = output.error;
      }
    }
  }, {
    key: 'buildGetChanges',
    value: function buildGetChanges() {
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var kernel = this.gpu.createKernelMap({
          addWeights: addWeights, calcChanges: calcChanges }, function (previousOutputs, deltas, weights, changes, learningRate, momentum) {
          var delta = deltas[this.thread.y];
          var change = calcChanges(changes, delta, previousOutputs, learningRate, momentum, this.thread.x, this.thread.y);

          return addWeights(change, weights, this.thread.x, this.thread.y);
        }, {
          constants: {
            size: this.outputs[layer - 1].length
          }
        }).setOutput([this.sizes[layer - 1], this.sizes[layer]]).setOutputToTexture(true);

        this.changesPropagate[layer] = kernel;
      }
    }
  }, {
    key: 'getChanges',
    value: function getChanges(learningRate) {
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var output = this.changesPropagate[layer](this.outputs[layer - 1], this.deltas[layer], this.weights[layer], this.changes[layer], learningRate, this.momentum);

        this.changes[layer] = output.calcChanges;
        this.weights[layer] = output.result;
      }
    }
  }, {
    key: 'buildChangeBiases',
    value: function buildChangeBiases() {
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var kernel = this.gpu.createKernelMap({
          addBiases: addBiases
        }, function (biases, deltas, learningRate) {
          return addBiases(biases, deltas, learningRate, this.thread.x);
        }).setOutput([this.sizes[layer]]).setOutputToTexture(true);

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
  }, {
    key: 'buildGetMSE',
    value: function buildGetMSE() {
      var kernel = this.gpu.createKernel(mse, {
        output: [1],
        constants: {
          size: this.outputLayer
        }
      });
      this.getMSE = kernel;
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
  }, {
    key: 'toFunction',
    value: function toFunction() {
      throw new Error('not implemented on NeuralNetworkGPU');
    }
  }]);

  return NeuralNetworkGPU;
}(_neuralNetwork2.default);

exports.default = NeuralNetworkGPU;


function weightedSumSigmoid(weights, biases, x, inputs) {
  var sum = biases[x];
  for (var k = 0; k < this.constants.size; k++) {
    sum += weights[x][k] * inputs[k];
  }
  //sigmoid
  return 1 / (1 + Math.exp(-sum));
}

function weightedSumRelu(weights, biases, x, inputs) {
  var sum = biases[x];
  for (var k = 0; k < this.constants.size; k++) {
    sum += weights[x][k] * inputs[k];
  }
  //relu
  return sum < 0 ? 0 : sum;
}

function weightedSumLeakyRelu(weights, biases, x, inputs) {
  var sum = biases[x];
  for (var k = 0; k < this.constants.size; k++) {
    sum += weights[x][k] * inputs[k];
  }
  //leaky relu
  return sum < 0 ? 0 : 0.01 * sum;
}

function weightedSumTanh(weights, biases, x, inputs) {
  var sum = biases[x];
  for (var k = 0; k < this.constants.size; k++) {
    sum += weights[x][k] * inputs[k];
  }
  //tanh
  return Math.tanh(sum);
}

function calcError(outputs, target) {
  return target[this.thread.x] - outputs;
}

function calcDeltasSigmoid(error, output) {
  //sigmoid derivative
  return error * output * (1 - output);
}

function calcDeltasRelu(error, output) {
  //relu derivative
  return output > 0 ? error : 0;
}

function calcDeltasLeakyRelu(error, output) {
  //leaky relu derivative
  return output > 0 ? error : 0.01 * error;
}

function calcDeltasTanh(error, output) {
  //tanh derivative
  return (1 - output * output) * error;
}

function calcErrorOutput(nextWeights, nextDeltas) {
  var error = 0;
  for (var k = 0; k < this.constants.size; k++) {
    error += nextDeltas[k] * nextWeights[k][this.thread.x];
  }
  return error;
}

function calcChanges(previousChange, deltas, previousOutputs, learningRate, momentum, x, y) {
  var sum = 0;
  for (var i = 0; i < this.constants.size; i++) {
    sum += learningRate * deltas * previousOutputs[x] + momentum * previousChange[y][i];
  }
  return sum;
}

function addWeights(change, weights, x, y) {
  return change + weights[y][x];
}

function addBiases(biases, deltas, learningRate, x) {
  return biases[x] + deltas[x] * learningRate;
}

// mean squared error, reimplemented for GPU
function mse(errors) {
  var sum = 0;
  for (var i = 0; i < this.constants.size; i++) {
    sum += Math.pow(errors[i], 2);
  }
  return sum / this.constants.size;
}
//# sourceMappingURL=neural-network-gpu.js.map