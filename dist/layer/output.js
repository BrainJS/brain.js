'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _makeKernel = require('../utilities/make-kernel');

var _makeKernel2 = _interopRequireDefault(_makeKernel);

var _randos = require('../utilities/randos');

var _randos2 = _interopRequireDefault(_randos);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Output = function (_Base) {
  _inherits(Output, _Base);

  function Output(settings, inputLayer) {
    _classCallCheck(this, Output);

    var _this = _possibleConstructorReturn(this, (Output.__proto__ || Object.getPrototypeOf(Output)).call(this, settings));

    _this.inputLayer = inputLayer;
    _this.weights = (0, _randos2.default)(_this.width);
    return _this;
  }

  _createClass(Output, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.compareKernel = (0, _makeKernel2.default)(compare, {
        map: {
          deltas: setDelta,
          errors: setError
        },
        output: [this.width]
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      this.weights = this.inputLayer.weights;
    }
  }, {
    key: 'compare',
    value: function compare(target) {
      var _compareKernel = this.compareKernel(target, this.weights),
          errors = _compareKernel.errors,
          deltas = _compareKernel.deltas;

      this.errors = errors;
      this.deltas = deltas;
    }
  }, {
    key: 'learn',
    value: function learn(target) {}
  }]);

  return Output;
}(_base2.default);

exports.default = Output;


function setDelta(delta) {
  return delta;
}

function setError(error) {
  return error;
}

function compare(target, weights) {
  var weight = weights[this.thread.x];
  var error = target[this.thread.x] - weight;
  setDelta(error * weight);
  return setError(error);
}
//# sourceMappingURL=output.js.map