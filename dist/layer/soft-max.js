'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.getMaxValue = getMaxValue;
exports.getMaxValue2D = getMaxValue2D;
exports.getMaxValue3D = getMaxValue3D;
exports.getSum = getSum;
exports.getSum2D = getSum2D;
exports.getSum3D = getSum3D;
exports.getExponentials = getExponentials;
exports.getExponentials2D = getExponentials2D;
exports.getExponentials3D = getExponentials3D;
exports.predict = predict;
exports.predict2D = predict2D;
exports.predict3D = predict3D;
exports.compare = compare;
exports.compare2D = compare2D;
exports.compare3D = compare3D;
exports.loss = loss;

var _kernel = require('../utilities/kernel');

var _types = require('./types');

var _randos = require('../utilities/randos');

var _randos2 = _interopRequireDefault(_randos);

var _randos2d = require('../utilities/randos-2d');

var _randos2d2 = _interopRequireDefault(_randos2d);

var _randos3d = require('../utilities/randos-3d');

var _randos3d2 = _interopRequireDefault(_randos3d);

var _zeros = require('../utilities/zeros');

var _zeros2 = _interopRequireDefault(_zeros);

var _zeros2d = require('../utilities/zeros-2d');

var _zeros2d2 = _interopRequireDefault(_zeros2d);

var _zeros3d = require('../utilities/zeros-3d');

var _zeros3d2 = _interopRequireDefault(_zeros3d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
        _this.weights = (0, _randos3d2.default)(_this.width, _this.height, _this.depth);
        _this.deltas = (0, _zeros3d2.default)(_this.width, _this.height, _this.depth);
      } else {
        _this.weights = (0, _randos2d2.default)(_this.width, _this.height);
        _this.deltas = (0, _zeros2d2.default)(_this.width, _this.height);
      }
    } else {
      _this.weights = (0, _randos2.default)(_this.width);
      _this.deltas = (0, _zeros2.default)(_this.width);
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
        this.getExponentialsKernel = (0, _kernel.makeKernel)(getExponentials3D, {
          output: [width, height, depth]
        });
        this.getMaxValueKernel = (0, _kernel.makeKernel)(getMaxValue3D, {
          output: [1, 1, 1],
          constants: {
            inputWidth: width,
            inputHeight: height,
            inputDepth: depth
          }
        });
        this.getSumKernel = (0, _kernel.makeKernel)(getSum3D, {
          output: [1, 1, 1],
          constants: {
            inputWidth: width,
            inputHeight: height,
            inputDepth: depth
          }
        });
        this.predictKernel = (0, _kernel.makeKernel)(predict3D, {
          output: [width, height, depth]
        });
        this.compareKernel = (0, _kernel.makeKernel)(compare3D, {
          output: [width, height, depth]
        });
      } else {
        this.getExponentialsKernel = (0, _kernel.makeKernel)(getExponentials, {
          output: [width, height]
        });
        this.getMaxValueKernel = (0, _kernel.makeKernel)(getMaxValue2D, {
          output: [1, 1],
          constants: {
            inputWidth: width,
            inputHeight: height
          }
        });
        this.getSumKernel = (0, _kernel.makeKernel)(getSum2D, {
          output: [1, 1],
          constants: {
            inputWidth: width,
            inputHeight: height
          }
        });
        this.predictKernel = (0, _kernel.makeKernel)(predict2D, {
          output: [width, height]
        });
        this.compareKernel = (0, _kernel.makeKernel)(compare2D, {
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
}(_types.Filter);

exports.default = SoftMax;