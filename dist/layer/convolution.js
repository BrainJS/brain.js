'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var makeKernel = require('../utilities/kernel').makeKernel;

var _require = require('../utilities/layer-setup'),
    setStride = _require.setStride,
    setPadding = _require.setPadding;

var Filter = require('./types').Filter;
var randos = require('../utilities/randos');
var randos3D = require('../utilities/randos-3d');
var zeros3D = require('../utilities/zeros-3d');
var values = require('../utilities/values');

function predict(inputs, filters, biases) {
  var startFilterX = this.constants.paddingX - this.thread.x * this.constants.strideX;
  var startInputX = this.thread.x * this.constants.strideX - this.constants.paddingX;
  var endFilterX = Math.min(this.constants.filterWidth, startFilterX + this.constants.inputWidth);

  var startFilterY = this.constants.paddingY - this.thread.y * this.constants.strideY;
  var startInputY = this.thread.y * this.constants.strideY - this.constants.paddingY;
  var endFilterY = Math.min(this.constants.filterHeight, startFilterY + this.constants.inputHeight);

  var sum = 0;
  for (var z = 0; z < this.constants.inputDepth; z++) {
    for (var filterY = Math.max(0, startFilterY), inputY = Math.max(0, startInputY); filterY < endFilterY; filterY++, inputY++) {
      for (var filterX = Math.max(0, startFilterX), inputX = Math.max(0, startInputX); filterX < endFilterX; filterX++, inputX++) {
        sum += filters[z][filterY][filterX] * inputs[z][inputY][inputX];
      }
    }
  }
  return sum + biases[this.thread.z];
}

function compareFilterDeltas(filterDeltas, inputs, deltas) {
  var startDeltaX = Math.max(0, Math.ceil((this.constants.paddingX - this.thread.x) / this.constants.strideX));
  var startInputX = startDeltaX * this.constants.strideX + this.thread.x - this.constants.paddingX;
  var endDeltaX = Math.min(this.constants.deltaWidth, Math.floor((this.constants.inputWidth - 1 - this.thread.x + this.constants.paddingX) / this.constants.strideX) + 1);

  var startDeltaY = Math.max(0, Math.ceil((this.constants.paddingY - this.thread.y) / this.constants.strideY));
  var startInputY = startDeltaY * this.constants.strideY + this.thread.y - this.constants.paddingY;
  var endDeltaY = Math.min(this.constants.deltaHeight, Math.floor((this.constants.inputHeight - 1 - this.thread.y + this.constants.paddingY) / this.constants.strideY) + 1);

  var sum = filterDeltas[this.thread.z][this.thread.y][this.thread.x];
  for (var deltaY = startDeltaY, inputY = startInputY; deltaY < endDeltaY; deltaY++, inputY += this.constants.strideY) {
    for (var deltaX = startDeltaX, inputX = startInputX; deltaX < endDeltaX; deltaX++, inputX += this.constants.strideX) {
      sum += inputs[this.thread.z][inputY][inputX] * deltas[this.constants.deltaZ][deltaY][deltaX];
    }
  }
  return sum;
}

function compareInputDeltas(inputDeltas, filters, deltas) {
  var x = this.thread.x + this.constants.paddingX;
  var startDeltaX = x < this.constants.filterWidth ? 0 : Math.floor((x - this.constants.filterWidth + this.constants.strideX) / this.constants.strideX);
  var startFilterX = x - startDeltaX * this.constants.strideX;
  var endDeltaX = Math.min(startDeltaX + Math.floor(startFilterX / this.constants.strideX) + 1, this.constants.deltaWidth);

  var y = this.thread.y + this.constants.paddingY;
  var startDeltaY = y < this.constants.filterHeight ? 0 : Math.floor((y - this.constants.filterHeight + this.constants.strideY) / this.constants.strideY);
  var startFilterY = y - startDeltaY * this.constants.strideY;
  var endDeltaY = Math.min(startDeltaY + Math.floor(startFilterY / this.constants.strideY) + 1, this.constants.deltaHeight);

  var sum = inputDeltas[this.thread.z][this.thread.y][this.thread.x];
  var deltaY = startDeltaY;
  for (var filterY = startFilterY; deltaY < endDeltaY; filterY -= this.constants.strideY, deltaY++) {
    var deltaX = startDeltaX;
    for (var filterX = startFilterX; deltaX < endDeltaX; filterX -= this.constants.strideX, deltaX++) {
      sum += filters[this.thread.z][filterY][filterX] * deltas[this.constants.deltaZ][deltaY][deltaX];
    }
  }
  return sum;
}

function compareBiases(biasDeltas, deltas) {
  var sum = 0;
  for (var y = 0; y < this.constants.deltaHeight; y++) {
    for (var x = 0; x < this.constants.deltaWidth; x++) {
      sum += deltas[this.thread.z][y][x];
    }
  }
  return biasDeltas[this.thread.z][this.thread.y][this.thread.x] + sum;
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
    setStride(_this, settings);

    _this.padding = null;
    _this.paddingX = null;
    _this.paddingY = null;
    setPadding(_this, settings);

    _this.filterCount = settings.filterCount;
    _this.filterWidth = settings.filterWidth;
    _this.filterHeight = settings.filterHeight;

    _this.width = Math.floor((inputLayer.width + _this.paddingX * 2 - _this.filterWidth) / _this.strideX + 1);
    _this.height = Math.floor((inputLayer.height + _this.paddingY * 2 - _this.filterHeight) / _this.strideY + 1);
    _this.depth = _this.filterCount;
    _this.weights = randos3D(_this.width, _this.height, _this.depth);
    _this.deltas = zeros3D(_this.width, _this.height, _this.depth);

    _this.biases = values(_this.depth, _this.bias);
    _this.biasDeltas = randos(_this.depth);

    _this.filters = randos3D(_this.filterWidth, _this.filterHeight, _this.filterCount);
    _this.filterDeltas = zeros3D(_this.filterWidth, _this.filterHeight, _this.filterCount);

    _this.learnFilters = null;
    _this.learnInputs = null;
    _this.inputLayer = inputLayer;
    _this.validate();
    return _this;
  }

  _createClass(Convolution, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = makeKernel(predict, {
        constants: {
          inputWidth: this.inputLayer.width,
          inputHeight: this.inputLayer.height,
          inputDepth: this.inputLayer.depth,
          strideX: this.strideX,
          strideY: this.strideY,
          paddingX: this.paddingX,
          paddingY: this.paddingY,
          filterWidth: this.filterWidth,
          filterHeight: this.filterHeight
        },
        output: [this.width, this.height, this.depth]
      });

      this.compareFilterDeltasKernel = makeKernel(compareFilterDeltas, {
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
          filterWidth: this.filterWidth,
          filterHeight: this.filterHeight
        },
        output: [this.width, this.height, this.depth]
      });

      this.compareInputDeltasKernel = makeKernel(compareInputDeltas, {
        constants: {
          filterCount: this.filterCount
        },
        output: [this.inputLayer.width, this.inputLayer.height, this.inputLayer.depth]
      });

      this.compareBiasesKernel = makeKernel(compareBiases, {
        output: [1, 1, this.depth],
        constants: {
          deltaWidth: this.width,
          deltaHeight: this.height
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
      this.filterDeltas = this.compareFilterDeltasKernel(this.filterDeltas, this.inputLayer.weights, this.deltas);
      this.biasDeltas = this.compareBiasesKernel(this.biasDeltas, this.deltas);
      this.deltas = this.compareInputDeltasKernel(this.filters, this.inputLayer.deltas);
      this.inputLayer.deltas = this.deltas;
    }
  }, {
    key: 'learn',
    value: function learn(previousLayer, nextLayer, learningRate) {
      // TODO: handle filters
      this.weights = this.praxis.run(this, previousLayer, nextLayer, learningRate);
      this.deltas = zeros3D(this.width, this.height, this.depth);
    }
  }]);

  return Convolution;
}(Filter);

module.exports = { Convolution: Convolution, predict: predict, compareFilterDeltas: compareFilterDeltas, compareInputDeltas: compareInputDeltas, compareBiases: compareBiases };