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
    _this.biasCopies = [];
    _this.copyBias = [];
    _this.changesCopies = [];
    _this.copyChanges = [];
    _this.weightsCopies = [];
    _this.copyWeights = [];
    _this.errorCheckInterval = 100;
    _this.gpu = new _gpu2.default({ mode: options.mode });
    return _this;
  }

  /**
   *
   */


  _createClass(NeuralNetworkGPU, [{
    key: 'initialize',
    value: function initialize() {
      _get(NeuralNetworkGPU.prototype.__proto__ || Object.getPrototypeOf(NeuralNetworkGPU.prototype), 'initialize', this).call(this);
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
     * @param value
     * @param logErrorRate
     */

  }, {
    key: 'trainPattern',
    value: function trainPattern(value, logErrorRate) {
      // forward propagate
      this.runInput(value.input);

      // back propagate
      this.calculateDeltas(value.target);
      this.adjustWeights();

      if (logErrorRate) {
        return this.getMSE(this.errors[this.outputLayer])[0];
      } else {
        return null;
      }
    }
  }, {
    key: 'adjustWeights',
    value: function adjustWeights() {
      this.getChanges();
      this.changeBiases();
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
        this.forwardPropagate[layer] = this.gpu.createKernel(weightedSum, {
          output: [this.sizes[layer]],
          outputToTexture: true,
          hardcodeConstants: true,
          constants: {
            size: this.sizes[layer - 1]
          }
        });
      }

      this.texturizeInputData = this.gpu.createKernel(function (value) {
        return value[this.thread.x];
      }, {
        output: [this.sizes[1]],
        outputToTexture: true,
        hardcodeConstants: true,
        outputImmutable: true
      });
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
        this.outputs[layer] = this.forwardPropagate[layer](this.weights[layer], this.biases[layer], input);
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
          this.backwardPropagate[layer] = this.gpu.createKernelMap({
            error: _gpu2.default.alias('calcErrorOutput', calcErrorOutput),
            deltas: _gpu2.default.alias('calcDeltas', calcDeltas)
          }, function (outputs, targets) {
            var output = outputs[this.thread.x];
            return calcDeltas(calcErrorOutput(output, targets), output);
          }, {
            output: [this.sizes[layer]],
            outputToTexture: true,
            hardcodeConstants: true
          });
        } else {
          this.backwardPropagate[layer] = this.gpu.createKernelMap({
            error: _gpu2.default.alias('calcError', calcError),
            deltas: _gpu2.default.alias('calcDeltas', calcDeltas)
          }, function (nextWeights, outputs, nextDeltas) {
            var output = outputs[this.thread.x];
            return calcDeltas(calcError(nextWeights, nextDeltas), output);
          }, {
            output: [this.sizes[layer]],
            outputToTexture: true,
            hardcodeConstants: true,
            constants: {
              size: this.deltas[layer + 1].length
            }
          });
        }
      }
    }
  }, {
    key: 'calculateDeltas',
    value: function calculateDeltas(target) {
      for (var layer = this.outputLayer; layer > 0; layer--) {
        var output = void 0;

        if (layer === this.outputLayer) {
          output = this.backwardPropagate[layer](this.outputs[layer], target);
        } else {
          output = this.backwardPropagate[layer](this.weights[layer + 1], this.outputs[layer], this.deltas[layer + 1]);
        }

        this.deltas[layer] = output.deltas;
        this.errors[layer] = output.error;
      }
    }
  }, {
    key: 'buildGetChanges',
    value: function buildGetChanges() {
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        this.changesPropagate[layer] = this.gpu.createKernelMap({
          weights: _gpu2.default.alias('addWeights', addWeights),
          changes: _gpu2.default.alias('calcChanges', calcChanges)
        }, function (previousOutputs, deltas, weights, changes) {
          var change = calcChanges(changes, deltas, previousOutputs);

          return addWeights(change, weights);
        }, {
          output: [this.sizes[layer - 1], this.sizes[layer]],
          outputToTexture: true,
          hardcodeConstants: true,
          constants: {
            size: this.outputs[layer - 1].length,
            learningRate: this.trainOpts.learningRate,
            momentum: this.trainOpts.momentum
          }
        });

        this.copyChanges[layer] = this.gpu.createKernel(function (value) {
          return value[this.thread.y][this.thread.x];
        }, {
          output: this.changesPropagate[layer].output,
          outputToTexture: true,
          hardCodeConstants: true
        });

        this.copyWeights[layer] = this.gpu.createKernel(function (value) {
          return value[this.thread.y][this.thread.x];
        }, {
          output: this.changesPropagate[layer].output,
          outputToTexture: true,
          hardCodeConstants: true
        });
      }
    }
  }, {
    key: 'getChanges',
    value: function getChanges() {
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var output = this.changesPropagate[layer](this.outputs[layer - 1], this.deltas[layer], this.weightsCopies[layer] || this.weights[layer], this.changesCopies[layer] || this.changes[layer]);
        this.changes[layer] = output.changes;
        this.weights[layer] = output.weights;

        this.changesCopies[layer] = this.copyChanges[layer](output.changes);
        this.weightsCopies[layer] = this.copyWeights[layer](output.weights);
      }
    }
  }, {
    key: 'buildChangeBiases',
    value: function buildChangeBiases() {
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        this.biasesPropagate[layer] = this.gpu.createKernel(addBiases, {
          output: [this.sizes[layer]],
          outputToTexture: true,
          hardcodeConstants: true,
          constants: {
            learningRate: this.trainOpts.learningRate
          }
        });
        this.copyBias[layer] = this.gpu.createKernel(function (value) {
          return value[this.thread.x];
        }, {
          output: this.biasesPropagate[layer].output,
          outputToTexture: true,
          hardCodeConstants: true
        });
      }
    }
  }, {
    key: 'changeBiases',
    value: function changeBiases() {
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        this.biases[layer] = this.biasesPropagate[layer](this.biasCopies[layer] || this.biases[layer], this.deltas[layer]);
        this.biasCopies[layer] = this.copyBias[layer](this.biases[layer]);
      }
    }
  }, {
    key: 'buildGetMSE',
    value: function buildGetMSE() {
      this.getMSE = this.gpu.createKernel(mse, {
        output: [1],
        hardcodeConstants: true,
        constants: {
          size: this.sizes[this.outputLayer]
        }
      });
    }

    /**
     *
     * @param input
     * @returns {*}
     */

  }, {
    key: 'run',
    value: function run(input) {
      if (!this.isRunnable) return null;
      if (this.inputLookup) {
        input = _lookup2.default.toArray(this.inputLookup, input, this.inputLookupLength);
      }
      var inputTexture = this.texturizeInputData(input);
      var outputTextures = this.runInput(inputTexture);
      var output = void 0;
      if (outputTextures.toArray) {
        output = outputTextures.toArray(this.gpu);
      } else {
        output = outputTextures;
      }

      if (this.outputLookup) {
        output = _lookup2.default.toObject(this.outputLookup, output);
      }
      return output;
    }

    /**
     *
     * @param data
     * @param options
     * @protected
     * @return { data, status, endTime }
     */

  }, {
    key: 'prepTraining',
    value: function prepTraining(data, options) {
      var _this2 = this;

      this.updateTrainingOptions(options);
      data = this.formatData(data);
      var endTime = Date.now() + this.trainOpts.timeout;

      var status = {
        error: 1,
        iterations: 0
      };

      this.verifyIsInitialized(data);

      var texturizeOutputData = this.gpu.createKernel(function (value) {
        return value[this.thread.x];
      }, {
        output: [data[0].output.length],
        outputToTexture: true,
        hardcodeConstants: true,
        outputImmutable: true
      });

      return {
        data: data.map(function (set) {
          return {
            input: _this2.texturizeInputData(set.input),
            output: texturizeOutputData(set.output)
          };
        }),
        status: status,
        endTime: endTime
      };
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var _this3 = this;

      if (!this.weights[1].toArray) {
        // in fallback mode
        return _get(NeuralNetworkGPU.prototype.__proto__ || Object.getPrototypeOf(NeuralNetworkGPU.prototype), 'toJSON', this).call(this);
      }

      // in GPU mode
      var weights = [];
      var biases = [];
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        weights[layer] = Array.from(this.weights[layer].toArray(this.gpu));
        biases[layer] = Array.from(this.biases[layer].toArray(this.gpu));
      }

      // pseudo lo-fi decorator
      return _neuralNetwork2.default.prototype.toJSON.call({
        inputLookup: this.inputLookup,
        outputLookup: this.outputLookup,
        outputLayer: this.outputLayer,
        sizes: this.sizes,
        getTrainOptsJSON: function getTrainOptsJSON() {
          return _this3.getTrainOptsJSON();
        },
        weights: weights,
        biases: biases
      });
    }
  }]);

  return NeuralNetworkGPU;
}(_neuralNetwork2.default);

exports.default = NeuralNetworkGPU;


function weightedSumSigmoid(weights, biases, inputs) {
  var sum = biases[this.thread.x];
  for (var k = 0; k < this.constants.size; k++) {
    sum += weights[this.thread.x][k] * inputs[k];
  }
  //sigmoid
  return 1 / (1 + Math.exp(-sum));
}

function weightedSumRelu(weights, biases, inputs) {
  var sum = biases[this.thread.x];
  for (var k = 0; k < this.constants.size; k++) {
    sum += weights[this.thread.x][k] * inputs[k];
  }
  //relu
  return sum < 0 ? 0 : sum;
}

function weightedSumLeakyRelu(weights, biases, inputs) {
  var sum = biases[this.thread.x];
  for (var k = 0; k < this.constants.size; k++) {
    sum += weights[this.thread.x][k] * inputs[k];
  }
  //leaky relu
  return sum < 0 ? 0 : 0.01 * sum;
}

function weightedSumTanh(weights, biases, inputs) {
  var sum = biases[this.thread.x];
  for (var k = 0; k < this.constants.size; k++) {
    sum += weights[this.thread.x][k] * inputs[k];
  }
  //tanh
  return Math.tanh(sum);
}

function calcErrorOutput(output, targets) {
  return targets[this.thread.x] - output;
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

function calcError(nextWeights, nextDeltas) {
  var error = 0;
  for (var k = 0; k < this.constants.size; k++) {
    error += nextDeltas[k] * nextWeights[k][this.thread.x];
  }
  return error;
}

function calcChanges(previousChanges, deltas, previousOutputs) {
  return this.constants.learningRate * deltas[this.thread.y] * previousOutputs[this.thread.x] + this.constants.momentum * previousChanges[this.thread.y][this.thread.x];
}

function addWeights(change, weights) {
  return change + weights[this.thread.y][this.thread.x];
}

function addBiases(biases, deltas) {
  return biases[this.thread.x] + deltas[this.thread.x] * this.constants.learningRate;
}

// mean squared error, reimplemented for GPU
function mse(errors) {
  var sum = 0;
  for (var i = 0; i < this.constants.size; i++) {
    sum += Math.pow(errors[i], 2);
  }
  return sum / this.constants.size;
}