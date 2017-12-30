"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MRmsProp = exports.getMomentum = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _makeKernel = require("../utilities/make-kernel");

var _makeKernel2 = _interopRequireDefault(_makeKernel);

var _zeros2d = require("../utilities/zeros-2d");

var _zeros2d2 = _interopRequireDefault(_zeros2d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MomentumRootMeanSquaredPropagation = function () {
  _createClass(MomentumRootMeanSquaredPropagation, null, [{
    key: "defaults",
    get: function get() {
      return {
        decayRate: 0.999,
        regularizationStrength: 0.00001
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
  }

  _createClass(MomentumRootMeanSquaredPropagation, [{
    key: "run",
    value: function run(weights, deltas) {
      var output = this.momentumsKernel(weights, deltas, this.momentums, this.decayRate, this.regularizationStrength);
      this.momentums = output.momentums;
      return output.result;
    }
  }, {
    key: "setupKernels",
    value: function setupKernels() {
      this.momentumsKernel = (0, _makeKernel2.default)(momentumRootMeanSquaredPropagation, {
        output: [this.width, this.height],
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

/**
 * @description Momentum Root Mean Square Propagation Function
 * @returns {number}
 */
function momentumRootMeanSquaredPropagation(weights, deltas, previousMomentums, decayRate, regularizationStrength) {
  var delta = deltas[this.thread.y][this.thread.x];
  var weight = weights[this.thread.y][this.thread.x];
  var previousMomentum = previousMomentums[this.thread.y][this.thread.x];
  var momentum = getMomentum(delta, decayRate, previousMomentum);
  return weight + -this.constants.learningRate * delta / Math.sqrt(momentum + this.constants.smoothEps) - regularizationStrength * weight;
}

function getMomentum(delta, decay, previousMomentum) {
  return previousMomentum * decay + (1 - decay) * delta * delta;
}

exports.getMomentum = getMomentum;
exports.MRmsProp = MRmsProp;
//# sourceMappingURL=momentum-root-mean-squared-propagation.js.map