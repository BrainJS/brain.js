'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.predict = predict;
exports.learnInputs = learnInputs;
exports.learnFilters = learnFilters;
exports.learnBiases = learnBiases;

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _makeKernel = require('../utilities/make-kernel');

var _makeKernel2 = _interopRequireDefault(_makeKernel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FullyConnected = function (_Base) {
  _inherits(FullyConnected, _Base);

  function FullyConnected(settings, inputLayer) {
    _classCallCheck(this, FullyConnected);

    var _this = _possibleConstructorReturn(this, (FullyConnected.__proto__ || Object.getPrototypeOf(FullyConnected)).call(this, settings));

    if (_this.inputLayer.depth !== 1) {
      //TODO: make go away and handle 3d, should be fairly easy
      throw new Error('depth of 1 only supported at this time');
    }

    _this.width = inputLayer.width * inputLayer.height * inputLayer.depth;
    _this.inputLayer = inputLayer;
    _this.learnInputsKernel = null;
    _this.learnFiltersKernel = null;
    _this.learnBiasKernel = null;
    return _this;
  }

  _createClass(FullyConnected, [{
    key: 'setupKernels',
    value: function setupKernels() {
      var _this2 = this;

      this.predictKernel = (0, _makeKernel2.default)(predict, {
        output: [this.width],
        constants: {
          inputDepth: this.inputLayer.depth,
          inputHeight: this.inputLayer.height,
          inputWidth: this.inputLayer.width
        }
      });

      this.learnInputsKernel = (0, _makeKernel2.default)(learnInputs, {
        output: [this.width],
        constants: {
          inputDepth: this.inputLayer.depth,
          inputHeight: this.inputLayer.height,
          inputWidth: this.inputLayer.width
        }
      });

      this.learnFiltersKernel = (0, _makeKernel2.default)(learnFilters, {
        output: [this.width],
        constants: {
          inputDepth: this.inputLayer.depth,
          inputHeight: this.inputLayer.height,
          inputWidth: this.inputLayer.width
        }
      });

      this.learnBiasesKernel = (0, _makeKernel2.default)(learnBiases, {
        output: [this.width],
        constants: {
          inputDepth: this.inputLayer.depth,
          inputHeight: this.inputLayer.height,
          inputWidth: this.inputLayer.width
        }
      });

      this.learnKernel = function () {
        _this2.learnInputsKernel(_this2.filters, _this2.deltas);
        _this2.learnFiltersKernel(_this2.inputLayer.outputs, _this2.deltas);
        _this2.learnBiasKernel(_this2.biases, _this2.deltas);
      };
    }
  }, {
    key: 'predict',
    value: function predict() {
      this.weights = this.predictKernel(this.inputLayer.weights, this.filters, this.biases);
    }
  }, {
    key: 'learn',
    value: function learn() {
      this.filterDeltas = this.learnFilters(this.inputLayer, this.deltas);
      this.biases = this.learnBiasesKernel(this.bias, this.deltas);
      this.deltas = this.learnInputs(this.filters);
    }
  }]);

  return FullyConnected;
}(_base2.default);

exports.default = FullyConnected;
function predict(inputs, filters, biases) {
  var output = 0;
  for (var y = 0; y < this.constants.inputHeight; y++) {
    for (var x = 0; x < this.constants.inputWidth; x++) {
      output += inputs[y][x] * filters[y][x];
    }
  }
  return output + biases[this.thread.x];
}

function learnInputs(filters, weights) {
  var filterDelta = 0;
  for (var y = 0; y < this.constants.inputWidth; y++) {
    filterDelta += filters[this.thread.x][y] * weights[this.thread.x];
  }
  return filterDelta;
}

function learnFilters(inputs, weights) {
  //0 here should probably be depth
  return inputs[0][this.thread.y] * weights[this.thread.x];
}

function learnBiases(biases, deltas) {
  return biases[this.output.x] * deltas[this.output.x];
}
//# sourceMappingURL=fully-connected.js.map