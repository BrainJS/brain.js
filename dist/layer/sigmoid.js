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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Sigmoid = function (_Base) {
  _inherits(Sigmoid, _Base);

  function Sigmoid(inputLayer) {
    _classCallCheck(this, Sigmoid);

    var _this = _possibleConstructorReturn(this, (Sigmoid.__proto__ || Object.getPrototypeOf(Sigmoid)).call(this));

    _this.width = inputLayer.width;
    _this.height = inputLayer.height;
    _this.depth = inputLayer.depth;
    _this.inputLayer = inputLayer;
    return _this;
  }

  _createClass(Sigmoid, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = (0, _makeKernel2.default)(predict, {
        output: [this.width, this.height, this.depth],
        functions: [_sigmoid.sigmoid]
      });

      this.compareKernel = (0, _makeKernel2.default)(compare, {
        output: [this.width, this.height, this.depth],
        map: {
          errors: calcError,
          deltas: _sigmoid.sigmoidDerivative
        }
      });

      this.learnKernel = (0, _makeKernel2.default)(learn, {
        output: [this.width, this.height, this.depth],
        functions: [_sigmoid.sigmoidDerivative]
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      this.outputs = this.predictKernel(this.inputLayer.outputs);
    }
  }, {
    key: 'compare',
    value: function compare(previousLayer, nextLayer) {
      var _compareKernel = this.compareKernel(this.outputs, nextLayer.weights, nextLayer.deltas),
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
  return (0, _sigmoid.sigmoid)(inputs[this.thread.y][this.thread.x]);
}

function compare(outputs, nextLayerWeights, nextLayerDeltas) {
  var output = outputs[this.thread.x];
  return (0, _sigmoid.sigmoidDerivative)(output, calcError(nextLayerWeights, nextLayerDeltas));
}

function learn(weights, errors) {
  return (0, _sigmoid.sigmoidDerivative)(weights[this.thread.y][this.thread.x], errors[this.thread.y][this.thread.x]);
}

function calcError(nextWeights, nextDeltas) {
  var error = 0;
  for (var k = 0; k < this.output.x; k++) {
    error += nextDeltas[k] * nextWeights[k][this.thread.x];
  }
  return error;
}
//# sourceMappingURL=sigmoid.js.map