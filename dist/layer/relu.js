'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.predict = predict;
exports.compare = compare;
exports.predict3D = predict3D;
exports.compare3D = compare3D;

var _types = require('./types');

var _kernel = require('../utilities/kernel');

var _relu = require('../activation/relu');

var _zeros2d = require('../utilities/zeros-2d');

var _zeros2d2 = _interopRequireDefault(_zeros2d);

var _zeros3d = require('../utilities/zeros-3d');

var _zeros3d2 = _interopRequireDefault(_zeros3d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function predict(inputs) {
  return (0, _relu.activate)(inputs[this.thread.y][this.thread.x]);
}

function compare(weights, deltas) {
  return (0, _relu.measure)(weights[this.thread.y][this.thread.x], deltas[this.thread.y][this.thread.x]);
}

function predict3D(inputs) {
  return (0, _relu.activate)(inputs[this.thread.z][this.thread.y][this.thread.x]);
}

function compare3D(weights, deltas) {
  return (0, _relu.measure)(weights[this.thread.z][this.thread.y][this.thread.x], deltas[this.thread.z][this.thread.y][this.thread.x]);
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
      _this.weights = (0, _zeros3d2.default)(width, height, depth);
      _this.deltas = (0, _zeros3d2.default)(width, height, depth);
    } else {
      _this.depth = 1;
      _this.weights = (0, _zeros2d2.default)(width, height);
      _this.deltas = (0, _zeros2d2.default)(width, height);
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
        this.predictKernel = (0, _kernel.makeKernel)(predict3D, {
          output: [width, height, depth],
          functions: [_relu.activate]
        });

        this.compareKernel = (0, _kernel.makeKernel)(compare3D, {
          output: [width, height, depth],
          functions: [_relu.measure]
        });
      } else {
        this.predictKernel = (0, _kernel.makeKernel)(predict, {
          output: [width, height],
          functions: [_relu.activate]
        });

        this.compareKernel = (0, _kernel.makeKernel)(compare, {
          output: [width, height],
          functions: [_relu.measure]
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
}(_types.Activation);

exports.default = Relu;