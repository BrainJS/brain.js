'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Modifier = require('./types').Modifier;
var makeKernel = require('../utilities/kernel').makeKernel;

function transpose(array) {
  return array[this.thread.x][this.thread.y];
}

var Transpose = function (_Modifier) {
  _inherits(Transpose, _Modifier);

  function Transpose(inputLayer) {
    _classCallCheck(this, Transpose);

    var _this = _possibleConstructorReturn(this, (Transpose.__proto__ || Object.getPrototypeOf(Transpose)).call(this));

    _this.inputLayer = inputLayer;
    _this.width = _this.inputLayer.height;
    _this.height = _this.inputLayer.width;
    _this.validate();
    return _this;
  }

  _createClass(Transpose, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = makeKernel(transpose, {
        output: [this.height, this.width]
      });
      this.compareKernel = makeKernel(transpose, {
        output: [this.width, this.height]
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
      this.inputLayer.deltas = this.predictKernel(this.deltas);
    }
  }]);

  return Transpose;
}(Modifier);

module.exports = Transpose;