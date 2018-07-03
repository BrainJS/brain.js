'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _makeKernel = require('../utilities/make-kernel');

var _makeKernel2 = _interopRequireDefault(_makeKernel);

var _zeros2d = require('../utilities/zeros-2d');

var _zeros2d2 = _interopRequireDefault(_zeros2d);

var _types = require('./types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Target = function (_Filter) {
  _inherits(Target, _Filter);

  function Target(settings, inputLayer) {
    _classCallCheck(this, Target);

    var _this = _possibleConstructorReturn(this, (Target.__proto__ || Object.getPrototypeOf(Target)).call(this, settings));

    _this.inputLayer = inputLayer;

    // TODO: properly handle dimensions
    _this.width = inputLayer.width;
    _this.height = inputLayer.height;
    _this.validate();
    _this.weights = (0, _zeros2d2.default)(_this.width, _this.height);
    _this.deltas = (0, _zeros2d2.default)(_this.width, _this.height);
    _this.errors = (0, _zeros2d2.default)(_this.width, _this.height);
    return _this;
  }

  _createClass(Target, [{
    key: 'setupKernels',
    value: function setupKernels() {
      var compareFn = this.width === 1 ? compare1D : compare2D;
      this.compareKernel = (0, _makeKernel2.default)(compareFn, {
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
      this.inputLayer.deltas = this.deltas = this.errors = this.compareKernel(this.weights, targetValues);
    }
  }]);

  return Target;
}(_types.Filter);

exports.default = Target;


function compare1D(weights, targetValues) {
  return weights[this.thread.y][this.thread.x] - targetValues[this.thread.x];
}

function compare2D(weights, targetValues) {
  return weights[this.thread.y][this.thread.x] - targetValues[this.thread.y][this.thread.x];
}
//# sourceMappingURL=target.js.map