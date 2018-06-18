'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.predict = predict;
exports.compare = compare;

var _types = require('./types');

var _makeKernel = require('../utilities/make-kernel');

var _makeKernel2 = _interopRequireDefault(_makeKernel);

var _tanh = require('../activation/tanh');

var _zeros2d = require('../utilities/zeros-2d');

var _zeros2d2 = _interopRequireDefault(_zeros2d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tanh = function (_Activation) {
  _inherits(Tanh, _Activation);

  function Tanh(inputLayer) {
    _classCallCheck(this, Tanh);

    var _this = _possibleConstructorReturn(this, (Tanh.__proto__ || Object.getPrototypeOf(Tanh)).call(this));

    _this.inputLayer = inputLayer;

    var _this$inputLayer = _this.inputLayer,
        width = _this$inputLayer.width,
        height = _this$inputLayer.height,
        depth = _this$inputLayer.depth;

    _this.width = width;
    _this.height = height;
    _this.depth = depth;
    _this.validate();
    _this.weights = (0, _zeros2d2.default)(_this.width, _this.height);
    _this.deltas = (0, _zeros2d2.default)(_this.width, _this.height);
    return _this;
  }

  _createClass(Tanh, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = (0, _makeKernel2.default)(predict, {
        output: [this.width, this.height]
      });

      this.compareKernel = (0, _makeKernel2.default)(compare, {
        output: [this.width, this.height],
        functions: [_tanh.tanhDerivative]
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      this.weights = this.predictKernel(this.inputLayer.weights);
    }
  }, {
    key: 'compare',
    value: function compare() {
      this.deltas = this.compareKernel(this.weights, this.deltas);
    }
  }]);

  return Tanh;
}(_types.Activation);

exports.default = Tanh;
function predict(inputs) {
  return Math.tanh(inputs[this.thread.y][this.thread.x]);
}

function compare(weights, errors) {
  return (0, _tanh.tanhDerivative)(weights[this.thread.y][this.thread.x], errors[this.thread.y][this.thread.x]);
}
//# sourceMappingURL=tanh.js.map