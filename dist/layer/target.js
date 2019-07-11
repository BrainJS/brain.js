'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var makeKernel = require('../utilities/kernel').makeKernel;
var zeros = require('../utilities/zeros');
var zeros2D = require('../utilities/zeros-2d');
var zeros3D = require('../utilities/zeros-3d');
var Filter = require('./types').Filter;

function compare1D(weights, targetValues) {
  return weights[this.thread.y][this.thread.x] - targetValues[this.thread.x];
}

function compare2D(weights, targetValues) {
  return weights[this.thread.y][this.thread.x] - targetValues[this.thread.y][this.thread.x];
}

var Target = function (_Filter) {
  _inherits(Target, _Filter);

  function Target(settings, inputLayer) {
    _classCallCheck(this, Target);

    var _this = _possibleConstructorReturn(this, (Target.__proto__ || Object.getPrototypeOf(Target)).call(this, settings));

    _this.inputLayer = inputLayer;
    _this.width = inputLayer.width;
    _this.height = inputLayer.height;
    _this.depth = inputLayer.depth;
    _this.validate();
    if (_this.depth > 1) {
      _this.weights = zeros3D(_this.width, _this.height, _this.depth);
      _this.deltas = zeros3D(_this.width, _this.height, _this.depth);
      _this.errors = zeros3D(_this.width, _this.height, _this.depth);
    } else if (_this.height > 1) {
      _this.weights = zeros2D(_this.width, _this.height);
      _this.deltas = zeros2D(_this.width, _this.height);
      _this.errors = zeros2D(_this.width, _this.height);
    } else {
      _this.weights = zeros(_this.width);
      _this.deltas = zeros(_this.width);
      _this.errors = zeros(_this.width);
    }
    return _this;
  }

  _createClass(Target, [{
    key: 'setupKernels',
    value: function setupKernels() {
      var compareFn = this.width === 1 ? compare1D : compare2D;
      this.compareKernel = makeKernel(compareFn, {
        output: [this.width, this.height]
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      // NOTE: this looks like it shouldn't be, but the weights are immutable, and this is where they are reused.
      this.weights = this.inputLayer.weights;
    }
  }, {
    key: 'compare',
    value: function compare(targetValues) {
      // this is where weights attach to deltas
      // deltas will be zero on learn, so save it in error for comparing to mse later
      this.errors = this.compareKernel(this.weights, targetValues);
      this.deltas = this.errors;
      this.inputLayer.deltas = this.deltas;
    }
  }]);

  return Target;
}(Filter);

module.exports = Target;