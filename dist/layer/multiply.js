'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var makeKernel = require('../utilities/kernel').makeKernel;
var zeros2D = require('../utilities/zeros-2d');
var Operator = require('./types').Operator;

function predict(weights1, weights2) {
  var sum = 0;
  for (var i = 0; i < this.constants.size; i++) {
    sum += weights1[this.thread.y][i] * weights2[i][this.thread.x];
  }
  return sum;
}

function compareFromX(deltas, inputDeltas, inputWeights) {
  var sum = inputDeltas[this.thread.y][this.thread.x];
  for (var i = 0; i < this.constants.size; i++) {
    sum += deltas[this.thread.y][i] * inputWeights[this.thread.x][i];
  }
  return sum;
}

function compareFromY(deltas, inputDeltas, inputWeights) {
  var sum = inputDeltas[this.thread.y][this.thread.x];
  for (var i = 0; i < this.constants.size; i++) {
    sum += deltas[i][this.thread.x] * inputWeights[i][this.thread.y];
  }
  return sum;
}

var Multiply = function (_Operator) {
  _inherits(Multiply, _Operator);

  function Multiply(inputLayer1, inputLayer2) {
    _classCallCheck(this, Multiply);

    var _this = _possibleConstructorReturn(this, (Multiply.__proto__ || Object.getPrototypeOf(Multiply)).call(this));

    _this.inputLayer1 = inputLayer1;
    _this.inputLayer2 = inputLayer2;
    _this.compareKernel1 = null;
    _this.compareKernel2 = null;

    _this.width = inputLayer2.width;
    _this.height = inputLayer1.height;
    _this.validate();
    _this.weights = zeros2D(_this.width, _this.height);
    _this.deltas = zeros2D(_this.width, _this.height);
    return _this;
  }

  _createClass(Multiply, [{
    key: 'validate',
    value: function validate() {
      _get(Multiply.prototype.__proto__ || Object.getPrototypeOf(Multiply.prototype), 'validate', this).call(this);
      if (this.inputLayer1.width !== this.inputLayer2.height) {
        throw new Error('Layer width mismatch of ' + this.inputLayer1.width + ' and ' + this.inputLayer2.height);
      }
    }
  }, {
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = makeKernel(predict, {
        output: [this.width, this.height],
        constants: {
          size: this.inputLayer2.height
        }
      });
      this.compareKernel1 = makeKernel(compareFromX, {
        output: [this.inputLayer1.width, this.inputLayer1.height],
        constants: {
          size: this.inputLayer2.width
        }
      });
      this.compareKernel2 = makeKernel(compareFromY, {
        output: [this.inputLayer2.width, this.inputLayer2.height],
        constants: {
          size: this.inputLayer1.height
        }
      });
    }
  }, {
    key: 'reuseKernels',
    value: function reuseKernels(layer) {
      _get(Multiply.prototype.__proto__ || Object.getPrototypeOf(Multiply.prototype), 'reuseKernels', this).call(this, layer);
      this.compareKernel1 = layer.compareKernel1;
      this.compareKernel2 = layer.compareKernel2;
    }
  }, {
    key: 'predict',
    value: function predict() {
      this.weights = this.predictKernel(this.inputLayer1.weights, this.inputLayer2.weights);
    }
  }, {
    key: 'compare',
    value: function compare() {
      var newDeltas1 = this.compareKernel1(this.deltas, this.inputLayer1.deltas, this.inputLayer2.weights);
      var newDeltas2 = this.compareKernel2(this.deltas, this.inputLayer2.deltas, this.inputLayer1.weights);
      this.inputLayer2.deltas = newDeltas2;
      this.inputLayer1.deltas = newDeltas1;
    }
  }]);

  return Multiply;
}(Operator);

module.exports = { Multiply: Multiply, predict: predict, compareFromX: compareFromX, compareFromY: compareFromY };