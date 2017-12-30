'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.predict = predict;

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _makeKernel = require('../utilities/make-kernel');

var _makeKernel2 = _interopRequireDefault(_makeKernel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Weigh = function (_Base) {
  _inherits(Weigh, _Base);

  function Weigh(inputLayers) {
    _classCallCheck(this, Weigh);

    var _this = _possibleConstructorReturn(this, (Weigh.__proto__ || Object.getPrototypeOf(Weigh)).call(this));

    _this.inputLayers = inputLayers;

    if (inputLayers.height > 0) {
      throw new Error('inputLayers[0] should be height of 1');
    }
    //TODO: make this less sensitive
    _this.width = inputLayers[1].width;
    _this.height = 1;
    return _this;
  }

  _createClass(Weigh, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = (0, _makeKernel2.default)(predict, {
        output: [this.width, this.height],
        constants: {
          inputWidth: this.inputLayers[0].width
        }
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      this.weights = this.predictKernel(this.inputLayers[0].weights, this.inputLayers[1].weights);
    }
  }]);

  return Weigh;
}(_base2.default);

exports.default = Weigh;
function predict(weights1, weights2) {
  var sum = 0;
  for (var index = 0; index < this.constants.inputWidth; index++) {
    sum += weights1[0][index] * weights2[index][this.thread.x];
  }
  return sum;
}
//# sourceMappingURL=weigh.js.map