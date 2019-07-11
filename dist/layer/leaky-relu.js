'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Activation = require('./types').Activation;
var makeKernel = require('../utilities/kernel').makeKernel;
var lra = require('../activation/leaky-relu');
var activate = lra.activate;
var measure = lra.measure;

function predict(inputs) {
  return activate(inputs[this.thread.y][this.thread.x]);
}

function compare(weights, deltas) {
  return measure(weights[this.thread.y][this.thread.x], deltas[this.thread.y][this.thread.x]);
}

var LeakyRelu = function (_Activation) {
  _inherits(LeakyRelu, _Activation);

  function LeakyRelu(inputLayer) {
    _classCallCheck(this, LeakyRelu);

    var _this = _possibleConstructorReturn(this, (LeakyRelu.__proto__ || Object.getPrototypeOf(LeakyRelu)).call(this));

    _this.inputLayer = inputLayer;
    var width = inputLayer.width,
        height = inputLayer.height,
        depth = inputLayer.depth;

    _this.width = width;
    _this.height = height;
    _this.depth = depth;
    _this.validate();
    return _this;
  }

  _createClass(LeakyRelu, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = makeKernel(predict, {
        functions: [activate]
      });

      this.compareKernel = makeKernel(compare, {
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
      this.deltas = this.compareKernel(this.weights, this.deltas);
    }
  }]);

  return LeakyRelu;
}(Activation);

module.exports = { LeakyRelu: LeakyRelu, predict: predict, compare: compare };