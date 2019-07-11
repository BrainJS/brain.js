'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Filter = require('./types').Filter;
var makeKernel = require('../utilities/kernel').makeKernel;

var _require = require('../utilities/layer-setup'),
    setPadding = _require.setPadding,
    setStride = _require.setStride;

var zeros3D = require('../utilities/zeros-3d');
var randos3D = require('../utilities/randos-3d');

function setSwitchY(value) {
  return value;
}

function setSwitchX(value) {
  return value;
}

function predict(inputs) {
  var x = Math.floor(this.thread.x / this.output.x * this.constants.inputWidth - this.constants.paddingX);
  var y = Math.floor(this.thread.y / this.output.y * this.constants.inputHeight - this.constants.paddingY);
  var largestValue = -Infinity;
  var largestX = -1;
  var largestY = -1;

  // convolve centered at this particular location
  for (var filterY = 0; filterY < this.constants.filterHeight; filterY++) {
    // coordinates in the original input array coordinates
    var inputY = filterY + y;
    for (var filterX = 0; filterX < this.constants.filterWidth; filterX++) {
      var inputX = filterX + x;
      if (inputY >= 0 && inputY < this.constants.inputHeight && inputX >= 0 && inputX < this.constants.inputWidth) {
        var input = inputs[this.thread.z][inputY][inputX];
        if (input > largestValue) {
          largestValue = input;
          largestY = inputY;
          largestX = inputX;
        }
      }
    }
  }
  setSwitchY(largestY);
  setSwitchX(largestX);
  return largestValue;
}

function compare(deltas, switchY, switchX) {
  var x = Math.floor(this.thread.x / this.output.x * this.constants.outputWidth);
  var y = Math.floor(this.thread.y / this.output.y * this.constants.outputHeight);

  var value = 0;

  for (var deltasY = 0; deltasY < this.constants.inputHeight; deltasY++) {
    for (var deltasX = 0; deltasX < this.constants.inputWidth; deltasX++) {
      var switchXValue = switchX[deltasY][deltasX];
      var switchYValue = switchY[deltasY][deltasX];
      if (switchXValue === x && switchYValue === y) {
        value += deltas[deltasY][deltasX];
      }
    }
  }

  return value;
}

function compare3D(deltas, switchY, switchX) {
  var x = Math.floor(this.thread.x / this.output.x * this.constants.outputWidth);
  var y = Math.floor(this.thread.y / this.output.y * this.constants.outputHeight);

  var value = 0;

  for (var deltasY = 0; deltasY < this.constants.inputHeight; deltasY++) {
    for (var deltasX = 0; deltasX < this.constants.inputWidth; deltasX++) {
      var switchXValue = switchX[this.thread.z][deltasY][deltasX];
      var switchYValue = switchY[this.thread.z][deltasY][deltasX];
      if (switchXValue === x && switchYValue === y) {
        value += deltas[this.thread.z][deltasY][deltasX];
      }
    }
  }

  return value;
}

var Pool = function (_Filter) {
  _inherits(Pool, _Filter);

  _createClass(Pool, null, [{
    key: 'defaults',
    get: function get() {
      return {
        padding: 0,
        bias: 0,
        filterWidth: 0,
        filterHeight: 0,
        filterCount: 0
      };
    }
  }]);

  function Pool(settings, inputLayer) {
    _classCallCheck(this, Pool);

    var _this = _possibleConstructorReturn(this, (Pool.__proto__ || Object.getPrototypeOf(Pool)).call(this, settings));

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
    // TODO: handle 1 depth?
    _this.depth = _this.filterCount;

    _this.weights = randos3D(_this.width, _this.height, _this.depth);
    _this.deltas = zeros3D(_this.width, _this.height, _this.depth);

    _this.filters = randos3D(_this.filterWidth, _this.filterHeight, _this.filterCount);
    _this.filterDeltas = zeros3D(_this.filterWidth, _this.filterHeight, _this.filterCount);

    _this.learnFilters = null;
    _this.learnInputs = null;
    _this.inputLayer = inputLayer;
    _this.validate();
    return _this;
  }

  _createClass(Pool, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = makeKernel(predict, {
        output: [this.width, this.height, this.depth],
        map: {
          switchX: setSwitchX,
          switchY: setSwitchY
        },
        constants: {
          inputWidth: this.inputLayer.width,
          inputHeight: this.inputLayer.height,
          paddingX: this.paddingX,
          paddingY: this.paddingY,
          filterHeight: this.filterHeight,
          filterWidth: this.filterWidth
        }
      });

      this.compareKernel = makeKernel(compare, {
        output: [this.inputLayer.width, this.inputLayer.height, this.inputLayer.depth],
        constants: {
          outputWidth: this.width,
          outputHeight: this.height,
          outputDepth: this.depth,
          paddingX: this.paddingX,
          paddingY: this.paddingY
        }
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      var weights = this.predictKernel(this.inputLayer.weights);
      this.switchX = weights.switchX;
      this.switchY = weights.switchY;
      this.weights = weights.result;
      return this.weights;
    }
  }, {
    key: 'compare',
    value: function compare() {
      debugger;
      var depth = this.inputLayer.deltas.length;
      var height = this.inputLayer.deltas[0].length;
      var width = this.inputLayer.deltas[0][0].length;
      var type = _typeof(this.inputLayer.deltas[0][0][0]);
      this.inputLayer.deltas = this.compareKernel(this.deltas, this.switchX, this.switchY);
      debugger;
      if (depth !== this.inputLayer.deltas.length) debugger;
      if (height !== this.inputLayer.deltas[0].length) debugger;
      if (width !== this.inputLayer.deltas[0][0].length) debugger;
      if (type !== _typeof(this.inputLayer.deltas[0][0][0])) debugger;
    }
  }]);

  return Pool;
}(Filter);

module.exports = { Pool: Pool, predict: predict, compare: compare, compare3D: compare3D };