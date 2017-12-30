'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.predict = predict;
exports.learn = learn;

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _makeKernel = require('../utilities/make-kernel');

var _makeKernel2 = _interopRequireDefault(_makeKernel);

var _sigmoid = require('../activation/sigmoid');

var _randos = require('../utilities/randos');

var _randos2 = _interopRequireDefault(_randos);

var _randos2d = require('../utilities/randos-2d');

var _randos2d2 = _interopRequireDefault(_randos2d);

var _zeros = require('../utilities/zeros');

var _zeros2 = _interopRequireDefault(_zeros);

var _zeros2d = require('../utilities/zeros-2d');

var _zeros2d2 = _interopRequireDefault(_zeros2d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Sigmoid = function (_Base) {
  _inherits(Sigmoid, _Base);

  function Sigmoid(inputLayer) {
    _classCallCheck(this, Sigmoid);

    var width = inputLayer.width,
        height = inputLayer.height;

    var _this = _possibleConstructorReturn(this, (Sigmoid.__proto__ || Object.getPrototypeOf(Sigmoid)).call(this, { width: width, height: height }));

    _this.inputLayer = inputLayer;
    _this.weights = (0, _randos2d2.default)(width, height);
    _this.deltas = (0, _zeros2.default)(width);
    return _this;
  }

  _createClass(Sigmoid, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = (0, _makeKernel2.default)(predict, {
        output: [this.width, this.height],
        functions: [_sigmoid.activate]
      });

      this.compareKernel = (0, _makeKernel2.default)(compare, {
        output: [this.width, this.height],
        map: {
          errors: calcError,
          deltas: _sigmoid.measure
        },
        constants: { width: this.width }
      });

      this.learnKernel = (0, _makeKernel2.default)(learn, {
        output: [this.width, this.height],
        functions: [_sigmoid.measure]
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      var result = this.predictKernel(this.inputLayer.weights);
      this.weights = result;
    }
  }, {
    key: 'compare',
    value: function compare(previousLayer, nextLayer) {
      var _compareKernel = this.compareKernel(this.weights, nextLayer.weights, nextLayer.deltas),
          errors = _compareKernel.errors,
          deltas = _compareKernel.deltas;

      this.errors = errors;
      this.deltas = deltas;
    }
  }, {
    key: 'learn',
    value: function learn() {
      this.deltas = this.learnKernel(this.weights, this.errors);
    }
  }]);

  return Sigmoid;
}(_base2.default);

exports.default = Sigmoid;
function predict(inputs) {
  return (0, _sigmoid.activate)(inputs[this.thread.y][this.thread.x]);
}

function compare(weights, nextLayerWeights, nextLayerDeltas) {
  var weight = weights[this.thread.x];
  return (0, _sigmoid.measure)(weight, calcError(nextLayerWeights, nextLayerDeltas));
}

function learn(weights, errors) {
  return (0, _sigmoid.measure)(weights[this.thread.y][this.thread.x], errors[this.thread.y][this.thread.x]);
}

function calcError(nextWeights, nextDeltas) {
  var error = 0;
  for (var k = 0; k < this.constants.width; k++) {
    debugger;
    error += nextDeltas[k] * nextWeights[k][this.thread.x];
  }
  return error;
}
//# sourceMappingURL=sigmoid.js.map