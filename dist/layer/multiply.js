'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.predict = predict;

var _makeKernel = require('../utilities/make-kernel');

var _makeKernel2 = _interopRequireDefault(_makeKernel);

var _operatorBase = require('./operator-base');

var _operatorBase2 = _interopRequireDefault(_operatorBase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Multiply = function (_OperatorBase) {
  _inherits(Multiply, _OperatorBase);

  function Multiply(inputLayers) {
    _classCallCheck(this, Multiply);

    var _this = _possibleConstructorReturn(this, (Multiply.__proto__ || Object.getPrototypeOf(Multiply)).call(this));

    if (inputLayers[0].width !== inputLayers[1].height) {
      throw new Error('Layer size mismatch');
    }
    _this.inputLayers = inputLayers;
    _this.width = inputLayers[0].width;
    _this.height = inputLayers[1].height;
    return _this;
  }

  _createClass(Multiply, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = (0, _makeKernel2.default)(predict, {
        output: [this.width, this.height]
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      this.weights = this.predictKernel(this.inputLayer[0].weights, this.inputLayer[1].weights);
    }
  }, {
    key: 'learn',
    value: function learn(previousLayer, nextLayer) {
      this.deltas = nextLayer.deltas;
    }
  }]);

  return Multiply;
}(_operatorBase2.default);

exports.default = Multiply;
function predict(inputs1, inputs2) {
  var sum = 0;
  for (var i = 0; i < this.output.x; i++) {
    sum += inputs1[this.thread.y][i] * inputs2[i][this.thread.x];
  }
  return sum;
}
//# sourceMappingURL=multiply.js.map