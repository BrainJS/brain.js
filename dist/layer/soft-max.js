'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var makeKernel = require('../utilities/kernel');
var Filter = require('./types').Filter;
var randos = require('../utilities/randos');
var randos2D = require('../utilities/randos-2d');
var randos3D = require('../utilities/randos-3d');
var zeros = require('../utilities/zeros');
var zeros2D = require('../utilities/zeros-2d');
var zeros3D = require('../utilities/zeros-3d');

function getMaxValue(inputs) {
  var maxInput = -Infinity;
  for (var x = 0; x < this.constants.inputWidth; x++) {
    var input = inputs[x];
    if (input > maxInput) {
      maxInput = input;
    }
  }
  return maxInput;
}

function getMaxValue2D(inputs) {
  var maxInput = -Infinity;
  for (var y = 0; y < this.constants.inputHeight; y++) {
    for (var x = 0; x < this.constants.inputWidth; x++) {
      var input = inputs[y][x];
      if (input > maxInput) {
        maxInput = input;
      }
    }
  }
  return maxInput;
}

function getMaxValue3D(inputs) {
  var maxInput = -Infinity;
  for (var z = 0; z < this.constants.inputDepth; z++) {
    for (var y = 0; y < this.constants.inputHeight; y++) {
      for (var x = 0; x < this.constants.inputWidth; x++) {
        var input = inputs[z][y][x];
        if (input > maxInput) {
          maxInput = input;
        }
      }
    }
  }
  return maxInput;
}

function getSum(inputs) {
  var sum = 0;
  for (var x = 0; x < this.constants.inputWidth; x++) {
    sum += inputs[x];
  }
  return sum;
}

function getSum2D(inputs) {
  var sum = 0;
  for (var y = 0; y < this.constants.inputHeight; y++) {
    for (var x = 0; x < this.constants.inputWidth; x++) {
      sum += inputs[y][x];
    }
  }
  return sum;
}

function getSum3D(inputs) {
  var sum = 0;
  for (var z = 0; z < this.constants.inputDepth; z++) {
    for (var y = 0; y < this.constants.inputHeight; y++) {
      for (var x = 0; x < this.constants.inputWidth; x++) {
        sum += inputs[z][y][x];
      }
    }
  }
  return sum;
}

function getExponentials(inputs, maxInput) {
  return Math.exp(inputs[this.thread.x] - maxInput[0]);
}

function getExponentials2D(inputs, maxInput) {
  return Math.exp(inputs[this.thread.y][this.thread.x] - maxInput[0]);
}

function getExponentials3D(inputs, maxInput) {
  return Math.exp(inputs[this.thread.z][this.thread.y][this.thread.x] - maxInput[0]);
}

function predict(exponentials, exponentialsSum) {
  return exponentials[this.thread.x] / exponentialsSum[0];
}

function predict2D(exponentials, exponentialsSum) {
  return exponentials[this.thread.y][this.thread.x] / exponentialsSum[0];
}

function predict3D(exponentials, exponentialsSum) {
  return exponentials[this.thread.z][this.thread.y][this.thread.x] / exponentialsSum[0];
}

function compare(target, exponentials) {
  var indicator = 0;
  if (this.thread.x === target) {
    indicator = 1;
  }
  return -(indicator - exponentials[this.thread.x]);
}

function compare2D(target, exponentials) {
  var indicator = 0;
  var index = this.thread.x + this.thread.y * this.output.x;
  if (index === target) {
    indicator = 1;
  }
  return -(indicator - exponentials[this.thread.y][this.thread.x]);
}

function compare3D(target, exponentials) {
  var indicator = 0;
  var index = this.thread.x + this.thread.y * this.output.x + this.thread.z * this.output.x * this.output.y;
  if (index === target) {
    indicator = 1;
  }
  return -(indicator - exponentials[this.thread.z][this.thread.y][this.thread.x]);
}

function loss(exponentials) {
  return -Math.log();
}

// TODO: handle: `return -Math.log(this.es[y]);` in learn

var SoftMax = function (_Filter) {
  _inherits(SoftMax, _Filter);

  function SoftMax(inputLayer) {
    _classCallCheck(this, SoftMax);

    var _this = _possibleConstructorReturn(this, (SoftMax.__proto__ || Object.getPrototypeOf(SoftMax)).call(this));

    _this.width = inputLayer.width;
    _this.height = inputLayer.height;
    _this.depth = inputLayer.depth;
    _this.getExponentialsKernel = null;
    _this.getMaxValueKernel = null;
    _this.getSumKernel = null;
    _this.inputLayer = inputLayer;
    _this.validate();
    if (_this.height > 1) {
      if (_this.depth > 1) {
        _this.weights = randos3D(_this.width, _this.height, _this.depth);
        _this.deltas = zeros3D(_this.width, _this.height, _this.depth);
      } else {
        _this.weights = randos2D(_this.width, _this.height);
        _this.deltas = zeros2D(_this.width, _this.height);
      }
    } else {
      _this.weights = randos(_this.width);
      _this.deltas = zeros(_this.width);
    }
    return _this;
  }

  _createClass(SoftMax, [{
    key: 'setupKernels',
    value: function setupKernels() {
      var width = this.width,
          height = this.height,
          depth = this.depth;

      if (depth > 1) {
        this.getExponentialsKernel = makeKernel(getExponentials3D, {
          output: [width, height, depth]
        });
        this.getMaxValueKernel = makeKernel(getMaxValue3D, {
          output: [1, 1, 1],
          constants: {
            inputWidth: width,
            inputHeight: height,
            inputDepth: depth
          }
        });
        this.getSumKernel = makeKernel(getSum3D, {
          output: [1, 1, 1],
          constants: {
            inputWidth: width,
            inputHeight: height,
            inputDepth: depth
          }
        });
        this.predictKernel = makeKernel(predict3D, {
          output: [width, height, depth]
        });
        this.compareKernel = makeKernel(compare3D, {
          output: [width, height, depth]
        });
      } else {
        this.getExponentialsKernel = makeKernel(getExponentials, {
          output: [width, height]
        });
        this.getMaxValueKernel = makeKernel(getMaxValue2D, {
          output: [1, 1],
          constants: {
            inputWidth: width,
            inputHeight: height
          }
        });
        this.getSumKernel = makeKernel(getSum2D, {
          output: [1, 1],
          constants: {
            inputWidth: width,
            inputHeight: height
          }
        });
        this.predictKernel = makeKernel(predict2D, {
          output: [width, height]
        });
        this.compareKernel = makeKernel(compare2D, {
          output: [width, height]
        });
      }
    }
  }, {
    key: 'predict',
    value: function predict() {
      var maxValue = this.getMaxValueKernel(this.inputLayer.weights);
      var exponentials = this.getExponentialsKernel(this.inputLayer.weights, maxValue);
      var exponentialsSum = this.getSumKernel(exponentials);
      this.weights = this.predictKernel(exponentials, exponentialsSum);
    }
  }, {
    key: 'compare',
    value: function compare(targetValues) {
      this.errors = this.compareKernel(targetValues[0], this.deltas);
      this.deltas = this.errors;
      this.inputLayer.deltas = this.deltas;
    }
  }]);

  return SoftMax;
}(Filter);

module.exports = { SoftMax: SoftMax,
  getMaxValue: getMaxValue, getMaxValue2D: getMaxValue2D, getMaxValue3D: getMaxValue3D,
  getSum: getSum, getSum2D: getSum2D, getSum3D: getSum3D,
  getExponentials: getExponentials, getExponentials2D: getExponentials2D, getExponentials3D: getExponentials3D,
  predict: predict, predict2D: predict2D, predict3D: predict3D,
  compare: compare, compare2D: compare2D, compare3D: compare3D,
  loss: loss };