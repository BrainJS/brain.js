'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.predict = predict;
exports.compareFilters = compareFilters;
exports.compareInputs = compareInputs;
exports.compareBiases = compareBiases;

var _kernel = require('../utilities/kernel');

var _layerSetup = require('../utilities/layer-setup');

var _types = require('./types');

var _randos = require('../utilities/randos');

var _randos2 = _interopRequireDefault(_randos);

var _randos3d = require('../utilities/randos-3d');

var _randos3d2 = _interopRequireDefault(_randos3d);

var _zeros3d = require('../utilities/zeros-3d');

var _zeros3d2 = _interopRequireDefault(_zeros3d);

var _values = require('../utilities/values');

var _values2 = _interopRequireDefault(_values);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

function compareFilters(filterDeltas, inputs, deltas) {
  var inputX = this.thread.x * this.constants.strideX - this.constants.paddingX;
  var inputY = this.thread.y * this.constants.strideY - this.constants.paddingY;
  var sum = filterDeltas[this.thread.z][this.thread.y][this.thread.x];
  for (var z = 0; z < this.constants.filterCount; z++) {
    for (var y = 0; y < this.constants.filterHeight; y++) {
      for (var x = 0; x < this.constants.filterWidth; x++) {
        sum += deltas[this.thread.z][inputY + y][inputX + x] * inputs[this.thread.z][y][x];
      }
    }
  }
  return sum;
}

function compareInputs(filters, deltas) {
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

function compareBiases(biasDeltas, deltas) {
  var sum = 0;
  for (var y = 0; y < this.constants.y; y++) {
    for (var x = 0; x < this.constants.x; x++) {
      sum += deltas[this.thread.z][y][x];
    }
  }
  return biasDeltas[this.thread.z] + sum;
}

var Convolution = function (_Filter) {
  _inherits(Convolution, _Filter);

  _createClass(Convolution, null, [{
    key: 'defaults',
    get: function get() {
      return {
        stride: 0,
        padding: 0,
        bias: 0.1,
        filterCount: 1,
        filterWidth: 0,
        filterHeight: 0
      };
    }
  }]);

  function Convolution(settings, inputLayer) {
    _classCallCheck(this, Convolution);

    var _this = _possibleConstructorReturn(this, (Convolution.__proto__ || Object.getPrototypeOf(Convolution)).call(this, settings));

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

    _this.width = Math.floor((inputLayer.width + _this.paddingX * 2 - _this.filterWidth) / _this.strideX + 1);
    _this.height = Math.floor((inputLayer.height + _this.paddingY * 2 - _this.filterHeight) / _this.strideY + 1);
    _this.depth = _this.filterCount;
    _this.weights = (0, _randos3d2.default)(_this.width, _this.height, _this.depth);
    _this.deltas = (0, _zeros3d2.default)(_this.width, _this.height, _this.depth);

    _this.biases = (0, _values2.default)(_this.depth, _this.bias);
    _this.biasDeltas = (0, _randos2.default)(_this.depth);

    _this.filters = (0, _randos3d2.default)(_this.filterWidth, _this.filterHeight, _this.filterCount);
    _this.filterDeltas = (0, _zeros3d2.default)(_this.filterWidth, _this.filterHeight, _this.filterCount);

    _this.learnFilters = null;
    _this.learnInputs = null;
    _this.inputLayer = inputLayer;
    _this.validate();
    return _this;
  }

  _createClass(Convolution, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = (0, _kernel.makeKernel)(predict, {
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

      this.compareFiltersKernel = (0, _kernel.makeKernel)(compareFilters, {
        constants: {
          deltasWidth: this.width,
          deltasHeight: this.height,
          deltasDepth: this.depth,
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

      this.compareInputsKernel = (0, _kernel.makeKernel)(compareInputs, {
        constants: {
          filterCount: this.filterCount
        },
        output: [this.inputLayer.width, this.inputLayer.height, this.inputLayer.depth]
      });

      this.compareBiasesKernel = (0, _kernel.makeKernel)(compareBiases, {
        output: [1, 1, this.inputLayer.depth],
        constants: {
          x: 1,
          y: 1
        }
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      this.weights = this.predictKernel(this.inputLayer.weights, this.filters, this.biases);
    }
  }, {
    key: 'compare',
    value: function compare() {
      this.filterDeltas = this.compareFiltersKernel(this.filterDeltas, this.inputLayer.weights, this.deltas);
      this.biasDeltas = this.compareBiasesKernel(this.biasDeltas, this.deltas);
      this.deltas = this.compareInputsKernel(this.filters, this.inputLayer.deltas);
      this.inputLayer.deltas = this.deltas;
    }
  }, {
    key: 'learn',
    value: function learn(previousLayer, nextLayer, learningRate) {
      // TODO: handle filters
      this.weights = this.praxis.run(this, previousLayer, nextLayer, learningRate);
      this.deltas = (0, _zeros3d2.default)(this.width, this.height, this.depth);
    }
  }]);

  return Convolution;
}(_types.Filter);

exports.default = Convolution;