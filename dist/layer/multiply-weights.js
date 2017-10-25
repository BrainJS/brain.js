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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MultiplyWeights = function (_Base) {
  _inherits(MultiplyWeights, _Base);

  function MultiplyWeights(settings, inputLayer) {
    _classCallCheck(this, MultiplyWeights);

    var _this = _possibleConstructorReturn(this, (MultiplyWeights.__proto__ || Object.getPrototypeOf(MultiplyWeights)).call(this, settings));

    _this.width = inputLayer.width;
    _this.height = inputLayer.height;
    _this.inputLayer = inputLayer;
    return _this;
  }

  _createClass(MultiplyWeights, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = (0, _makeKernel2.default)(predict, {
        output: [this.width, this.height]
      });

      this.learnKernel = (0, _makeKernel2.default)(learn, {
        output: [this.width, this.height]
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      this.outputs = this.predictKernel(this.inputLayer.outputs, this.weights);
    }
  }, {
    key: 'learn',
    value: function learn() {
      this.deltas = this.learnKernel(this.inputLayer.outputs, this.deltas);
    }
  }]);

  return MultiplyWeights;
}(_base2.default);

exports.default = MultiplyWeights;
function predict(inputs, weights) {
  var sum = 0;
  for (var i = 0; i < this.output.x; i++) {
    sum += weights[this.thread.y][i] * inputs[i][this.thread.x];
  }
  return sum;
}

function learn(inputs, deltas) {
  var delta = deltas[this.thread.y][this.thread.x];
  var sum = 0;
  for (var i = 0; i < this.output.x; i++) {
    sum += inputs[this.thread.y][i] * delta;
  }
  return sum;
}
//# sourceMappingURL=multiply-weights.js.map