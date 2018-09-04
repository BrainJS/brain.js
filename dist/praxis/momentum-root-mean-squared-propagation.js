'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MRmsProp = exports.getMomentum = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.clipByValue = clipByValue;
exports.isClippedByValue = isClippedByValue;

var _kernel = require('../utilities/kernel');

var _zeros2d = require('../utilities/zeros-2d');

var _zeros2d2 = _interopRequireDefault(_zeros2d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getMomentum(delta, decay, previousMomentum) {
  return previousMomentum * decay + (1 - decay) * delta * delta;
}

function clipByValue(value, max, min) {
  if (value > max) {
    return max;
  }
  if (value < min) {
    return min;
  }
  return value;
}

/**
 * @description Momentum Root Mean Square Propagation Function
 * @returns {number}
 */
function momentumRootMeanSquaredPropagation(weights, deltas, previousMomentums) {
  var delta = deltas[this.thread.y][this.thread.x];
  var clippedDelta = clipByValue(delta, this.constants.clipValue, -this.constants.clipValue);
  var weight = weights[this.thread.y][this.thread.x];
  var previousMomentum = previousMomentums[this.thread.y][this.thread.x];
  var momentum = getMomentum(delta, this.constants.decayRate, previousMomentum);
  return weight + -this.constants.learningRate * clippedDelta / Math.sqrt(momentum + this.constants.smoothEps) - this.constants.regularizationStrength * weight;
}

function isClippedByValue(value, max, min) {
  if (value > max) {
    return 1;
  }
  if (value < min) {
    return 1;
  }
  return 0;
}

var MomentumRootMeanSquaredPropagation = function () {
  _createClass(MomentumRootMeanSquaredPropagation, null, [{
    key: 'defaults',
    get: function get() {
      return {
        decayRate: 0.999,
        regularizationStrength: 0.000001,
        learningRate: 0.01,
        smoothEps: 1e-8,
        clipValue: 5
      };
    }
  }]);

  function MomentumRootMeanSquaredPropagation(layer) {
    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, MomentumRootMeanSquaredPropagation);

    this.layer = layer;
    this.width = layer.width;
    this.height = layer.height;
    this.momentums = (0, _zeros2d2.default)(layer.width, layer.height);
    Object.assign(this, this.constructor.defaults, settings);
    this.setupKernels();
  }

  _createClass(MomentumRootMeanSquaredPropagation, [{
    key: 'run',
    value: function run(layer, previousLayer, nextLayer, learningRate) {
      var output = this.kernel(layer.weights, layer.deltas, this.momentums);
      this.momentums = output.momentums;
      return output.result;
    }
  }, {
    key: 'setupKernels',
    value: function setupKernels() {
      this.kernel = (0, _kernel.makeKernel)(momentumRootMeanSquaredPropagation, {
        output: [this.width, this.height],
        constants: {
          clipValue: this.clipValue,
          decayRate: this.decayRate,
          learningRate: this.learningRate,
          regularizationStrength: this.regularizationStrength,
          smoothEps: this.smoothEps
        },
        functions: [clipByValue],
        map: {
          momentums: getMomentum
        }
      });
    }
  }]);

  return MomentumRootMeanSquaredPropagation;
}();

/**
 * @description Mathematician friendly name of MomentumRootMeanSquaredPropagation class. For those that are not mere mortals
 * @type {MomentumRootMeanSquaredPropagation}
 */


exports.default = MomentumRootMeanSquaredPropagation;
var MRmsProp = MomentumRootMeanSquaredPropagation;

exports.getMomentum = getMomentum;
exports.MRmsProp = MRmsProp;