'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Activation = require('./types').Activation;
var makeKernel = require('../utilities/kernel').makeKernel;

var _require = require('../activation/relu'),
    activate = _require.activate,
    measure = _require.measure;

var zeros2D = require('../utilities/zeros-2d');
var zeros3D = require('../utilities/zeros-3d');

function predict(inputs) {
  return activate(inputs[this.thread.y][this.thread.x]);
}

function compare(weights, deltas) {
  return measure(weights[this.thread.y][this.thread.x], deltas[this.thread.y][this.thread.x]);
}

function predict3D(inputs) {
  return activate(inputs[this.thread.z][this.thread.y][this.thread.x]);
}

function compare3D(weights, deltas) {
  return measure(weights[this.thread.z][this.thread.y][this.thread.x], deltas[this.thread.z][this.thread.y][this.thread.x]);
}

var Relu = function (_Activation) {
  _inherits(Relu, _Activation);

  function Relu(inputLayer) {
    _classCallCheck(this, Relu);

    var _this = _possibleConstructorReturn(this, (Relu.__proto__ || Object.getPrototypeOf(Relu)).call(this));

    _this.inputLayer = inputLayer;

    var width = inputLayer.width,
        height = inputLayer.height,
        depth = inputLayer.depth;

    _this.width = width;
    _this.height = height;
    _this.validate();
    if (depth > 1) {
      _this.depth = depth;
      _this.weights = zeros3D(width, height, depth);
      _this.deltas = zeros3D(width, height, depth);
    } else {
      _this.depth = 1;
      _this.weights = zeros2D(width, height);
      _this.deltas = zeros2D(width, height);
    }
    return _this;
  }

  _createClass(Relu, [{
    key: 'setupKernels',
    value: function setupKernels() {
      var _inputLayer = this.inputLayer,
          width = _inputLayer.width,
          height = _inputLayer.height,
          depth = _inputLayer.depth;

      if (this.depth > 1) {
        this.predictKernel = makeKernel(predict3D, {
          output: [width, height, depth],
          functions: [activate]
        });

        this.compareKernel = makeKernel(compare3D, {
          output: [width, height, depth],
          functions: [measure]
        });
      } else {
        this.predictKernel = makeKernel(predict, {
          output: [width, height],
          functions: [activate]
        });

        this.compareKernel = makeKernel(compare, {
          output: [width, height],
          functions: [measure]
        });
      }
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

  return Relu;
}(Activation);

module.exports = { Relu: Relu, predict: predict, compare: compare, predict3D: predict3D, compare3D: compare3D };