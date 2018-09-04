'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _kernel = require('../utilities/kernel');

var _types = require('./types');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function predict(weights) {
  return -weights[this.thread.y][this.thread.x];
}

var Negative = function (_Modifier) {
  _inherits(Negative, _Modifier);

  function Negative(settings, inputLayer) {
    _classCallCheck(this, Negative);

    var _this = _possibleConstructorReturn(this, (Negative.__proto__ || Object.getPrototypeOf(Negative)).call(this, settings));

    _this.inputLayer = inputLayer;
    _this.validate();
    return _this;
  }

  _createClass(Negative, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = (0, _kernel.makeKernel)(predict, {
        output: [this.width, this.height]
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      this.weights = this.predictKernel(this.inputLayer.weights);
    }
  }]);

  return Negative;
}(_types.Modifier);

exports.default = Negative;