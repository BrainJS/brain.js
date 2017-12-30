'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.predict = predict;
exports.learnFilters = learnFilters;
exports.learnInputs = learnInputs;

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _makeKernel = require('../utilities/make-kernel');

var _makeKernel2 = _interopRequireDefault(_makeKernel);

var _layerSetup = require('../utilities/layer-setup');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Convolution = function (_Base) {
  _inherits(Convolution, _Base);

  _createClass(Convolution, null, [{
    key: 'defaults',
    get: function get() {
      return {
        stride: 0,
        padding: 0,
        bias: 0,
        filterCount: 1,
        filterWidth: 0,
        filterHeight: 0
      };
    }
  }]);

  function Convolution(settings, inputLayer) {
    _classCallCheck(this, Convolution);

    var _this = _possibleConstructorReturn(this, (Convolution.__proto__ || Object.getPrototypeOf(Convolution)).call(this, settings));

    _this.width = Math.floor((inputLayer.width + _this.paddingX * 2 - _this.filterWidth) / _this.strideX + 1);
    _this.height = Math.floor((inputLayer.height + _this.paddingY * 2 - _this.filterHeight) / _this.strideY + 1);
    _this.depth = _this.filterCount;

    _this.stride = null;
    _this.strideX = null;
    _this.strideY = null;
    (0, _layerSetup.setStride)(_this, settings);

    _this.padding = null;
    _this.paddingX = null;
    _this.paddingY = null;
    (0, _layerSetup.setPadding)(_this, settings);

    _this.filterCount = settings.filterCount;
    _this.filterWidth = settings.filterWidth;
    _this.filterHeight = settings.filterHeight;

    _this.bias = settings.bias;

    _this.filters = null;
    _this.filterDeltas = null;

    _this.learnFilters = null;
    _this.learnInputs = null;
    _this.inputLayer = inputLayer;
    return _this;
  }

  _createClass(Convolution, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = (0, _makeKernel2.default)(predict, {
        constants: {
          inputWidth: this.inputLayer.width,
          inputHeight: this.inputLayer.height,
          inputDepth: this.inputLayer.depth,
          strideX: this.strideX,
          strideY: this.strideY,
          paddingX: this.paddingX,
          paddingY: this.paddingY,
          filterCount: this.filterCount,
          filterWidth: this.filterWidth,
          filterHeight: this.filterHeight
        },
        output: [this.width, this.height, this.depth]
      });

      this.compareKernel = (0, _makeKernel2.default)(compare, {
        output: [this.width, this.height, this.depth]
      });

      this.learnFilters = (0, _makeKernel2.default)(learnFilters, {
        output: [this.filterWidth, this.filterHeight, this.filterCount]
      });

      this.learnInputs = (0, _makeKernel2.default)(learnInputs, {
        output: [this.inputLayer.width, this.inputLayer.height, this.inputLayer.depth]
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      this.weights = this.predictKernel(this.inputLayer.weights, this.filters, this.biases);
    }
  }, {
    key: 'learn',
    value: function learn() {
      this.filterDeltas = this.learnFilters(this.inputLayer.weights, this.deltas);
      this.deltas = this.learnInputs(this.filters);
    }
  }]);

  return Convolution;
}(_base2.default);

exports.default = Convolution;
function predict(inputs, filters, biases) {
  var x = this.thread.x / this.output.x * this.constants.inputWidth * this.constants.strideX - this.constants.paddingX;
  var y = this.thread.y / this.output.y * this.constants.inputHeight * this.constants.strideY - this.constants.paddingY;

  // convolve centered at this particular location
  var sum = 0;
  for (var filterY = 0; filterY < this.constants.filterHeight; filterY++) {
    // coordinates in the original input array coordinates
    var inputY = filterY + y;
    for (var filterX = 0; filterX < this.constants.filterWidth; filterX++) {
      var inputX = filterX + x;
      if (inputY >= 0 && inputY < this.constants.inputHeight && inputX >= 0 && inputX < this.constants.inputWidth) {
        for (var inputIndex = 0; inputIndex < this.constants.inputDepth; inputIndex++) {
          for (var filterIndex = 0; filterIndex < this.constants.filterCount; filterIndex++) {
            sum += filters[filterIndex][filterY][filterX] * inputs[inputIndex][inputY][inputX];
          }
        }
      }
    }
  }
  return sum + biases[this.thread.z];
}

function learnFilters(inputs, deltas) {
  var sum = 0;
  var delta = deltas[this.thread.z][this.thread.y * this.constants.paddingY][this.thread.x * this.constants.paddingX];
  var inputXMax = this.constants.inputWidth + this.constants.paddingX;
  var inputYMax = this.constants.inputHeight + this.constants.paddingY;
  for (var inputY = this.thread.y - this.constants.paddingY; inputY < inputYMax; inputY += this.constants.strideY) {
    for (var inputX = this.thread.x - this.constants.paddingX; inputX < inputXMax; inputX += this.constants.strideX) {
      if (inputY >= 0 && inputY < this.constants.inputHeight && inputX >= 0 && inputX < this.constants.inputWidth) {
        for (var inputIndex = 0; inputIndex < this.constants.inputDepth; inputIndex++) {
          sum += inputs[inputIndex][inputY][inputX] * delta;
        }
      }
    }
  }
  return sum;
}

function learnInputs(filters, deltas) {
  var sum = 0;
  for (var filterY = 0; filterY <= this.thread.y; filterY++) {
    var offsetY = this.thread.y - filterY;
    for (var filterX = 0; filterX <= this.thread.x; filterX++) {
      var offsetX = this.thread.x - filterX;
      for (var filterIndex = 0; filterIndex < this.constants.filterCount; filterIndex++) {
        sum += filters[filterIndex][offsetY][offsetX] * deltas[filterIndex][filterY][filterX];
      }
      offsetX--;
    }
    offsetY--;
  }
  return sum;
}
//# sourceMappingURL=convolution.js.map