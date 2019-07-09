'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Activation = require('./types').Activation;
var makeKernel = require('../utilities/kernel').makeKernel;
var sigmoid = require('../activation/sigmoid');
var activate = sigmoid.activate,
    measure = sigmoid.measure;

var zeros2D = require('../utilities/zeros-2d');

function predict(inputs) {
  return activate(inputs[this.thread.y][this.thread.x]);
}

function compare(weights, deltas) {
  var weight = weights[this.thread.y][this.thread.x];
  var delta = deltas[this.thread.y][this.thread.x];
  return measure(weight, delta);
}

var Sigmoid = function (_Activation) {
  _inherits(Sigmoid, _Activation);

  function Sigmoid(inputLayer) {
    _classCallCheck(this, Sigmoid);

    var _this = _possibleConstructorReturn(this, (Sigmoid.__proto__ || Object.getPrototypeOf(Sigmoid)).call(this));

    _this.inputLayer = inputLayer;

    var width = inputLayer.width,
        height = inputLayer.height;

    _this.width = width;
    _this.height = height;
    _this.validate();
    _this.weights = zeros2D(_this.width, _this.height);
    _this.deltas = zeros2D(_this.width, _this.height);
    return _this;
  }

  _createClass(Sigmoid, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = makeKernel(predict, {
        output: [this.width, this.height],
        functions: [activate]
      });

      this.compareKernel = makeKernel(compare, {
        output: [this.width, this.height],
        functions: [measure]
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      this.weights = this.predictKernel(this.inputLayer.weights);
    }
  }, {
    key: 'compare',
    value: function compare() {
      this.inputLayer.deltas = this.compareKernel(this.weights, this.deltas);
    }
  }]);

  return Sigmoid;
}(Activation);

module.exports = { Sigmoid: Sigmoid, predict: predict, compare: compare };