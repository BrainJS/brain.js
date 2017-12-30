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

var _tanh = require('../activation/tanh');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tanh = function (_Base) {
  _inherits(Tanh, _Base);

  function Tanh(inputLayer) {
    _classCallCheck(this, Tanh);

    var _this = _possibleConstructorReturn(this, (Tanh.__proto__ || Object.getPrototypeOf(Tanh)).call(this));

    _this.width = inputLayer.width;
    _this.height = inputLayer.height;
    _this.depth = inputLayer.depth;
    _this.inputLayer = inputLayer;
    return _this;
  }

  _createClass(Tanh, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = (0, _makeKernel2.default)(predict);

      this.learnKernel = (0, _makeKernel2.default)(learn, {
        functions: [_tanh.tanhDerivative]
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
      this.deltas = this.learnKernel(this.weights, this.errors);
    }
  }]);

  return Tanh;
}(_base2.default);

exports.default = Tanh;
function predict(inputs) {
  return Math.tanh(inputs[this.thread.y][this.thread.x]);
}

function learn(weights, errors) {
  return (0, _tanh.tanhDerivative)(weights[this.thread.y][this.thread.x], errors[this.thread.y][this.thread.x]);
}
//# sourceMappingURL=tanh.js.map