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

var _leakyRelu = require('../activation/leaky-relu');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LeakyRelu = function (_Base) {
  _inherits(LeakyRelu, _Base);

  function LeakyRelu(inputLayer) {
    _classCallCheck(this, LeakyRelu);

    var _this = _possibleConstructorReturn(this, (LeakyRelu.__proto__ || Object.getPrototypeOf(LeakyRelu)).call(this));

    _this.width = inputLayer.width;
    _this.height = inputLayer.height;
    _this.depth = inputLayer.depth;
    _this.inputLayer = inputLayer;
    return _this;
  }

  _createClass(LeakyRelu, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = (0, _makeKernel2.default)(predict, {
        functions: [_leakyRelu.leakyRelu]
      });

      this.learnKernel = (0, _makeKernel2.default)(learn, {
        functions: [_leakyRelu.leakyReluDerivative]
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      this.weights = this.predictKernel(this.inputLayer.weights);
    }
  }, {
    key: 'learn',
    value: function learn() {
      this.deltas = this.learnKernel(this.weights, this.deltas);
    }
  }]);

  return LeakyRelu;
}(_base2.default);

exports.default = LeakyRelu;
function predict(inputs) {
  return (0, _leakyRelu.leakyRelu)(inputs[this.thread.y][this.thread.x]);
}

function learn(weights, deltas) {
  return (0, _leakyRelu.leakyReluDerivative)(weights[this.thread.y][this.thread.x], deltas[this.thread.y][this.thread.x]);
}
//# sourceMappingURL=leaky-relu.js.map