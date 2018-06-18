'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _makeKernel = require('../utilities/make-kernel');

var _makeKernel2 = _interopRequireDefault(_makeKernel);

var _types = require('./types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SoftMax = function (_Filter) {
  _inherits(SoftMax, _Filter);

  function SoftMax(settings, inputLayer) {
    _classCallCheck(this, SoftMax);

    var _this = _possibleConstructorReturn(this, (SoftMax.__proto__ || Object.getPrototypeOf(SoftMax)).call(this, settings));

    _this.getExponentialsKernel = null;
    _this.getMaxValueKernel = null;
    _this.getSumKernel = null;
    _this.inputLayer = inputLayer;
    _this.validate();
    return _this;
  }

  _createClass(SoftMax, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.getExponentialsKernel = (0, _makeKernel2.default)(getExponentials, {
        output: [this.inputLayer.width, this.inputLayer.height, this.inputLayer.depth]
      });
      this.getMaxValueKernel = (0, _makeKernel2.default)(getMaxValue, {
        output: [1, 1, 1]
      });
      this.getSumKernel = (0, _makeKernel2.default)(getSum, {
        output: [1, 1, this.depth]
      });
      this.predictKernel = (0, _makeKernel2.default)(predict, {
        output: [this.inputLayer.width, this.inputLayer.height, this.inputLayer.depth]
      });
      this.compareKernel = (0, _makeKernel2.default)(compare, {
        output: [this.width, this.height, this.depth]
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      var maxValue = this.getMaxValueKernel(this.inputLayer.weights);
      var exponentials = this.getExponentialsKernel(this.inputLayer.weights, maxValue);
      var exponentialsSum = this.getSumKernel(exponentials);
      this.weights = this.predictKernel(exponentials, exponentialsSum);
    }
  }, {
    key: 'compare',
    value: function compare() {
      this.inputLayer.deltas = this.deltas;
    }
  }]);

  return SoftMax;
}(_types.Filter);

exports.default = SoftMax;


function getMaxValue(inputs) {
  var maxInput = -Infinity;
  for (var z = 0; z < this.output.z; z++) {
    for (var y = 0; y < this.output.y; y++) {
      for (var x = 0; x < this.output.x; x++) {
        var input = inputs[z][y][x];
        if (input > maxInput) {
          maxInput = input;
        }
      }
    }
  }
  return maxInput;
}

function getSum(inputs) {
  var sum = 0;
  for (var z = 0; z < this.output.z; z++) {
    for (var y = 0; y < this.output.y; y++) {
      for (var x = 0; x < this.output.x; x++) {
        sum += inputs[z][y][x];
      }
    }
  }
  return sum;
}

function getExponentials(inputs, maxInput) {
  return Math.exp(inputs[this.thread.z][this.thread.y][this.thread.x] - maxInput[0]);
}

function predict(exponentials, exponentialsSum) {
  return exponentials[this.thread.z][this.thread.y][this.thread.x] / exponentialsSum[0];
}

function compare(target, exponentials) {
  var indicator = this.thread.x === target ? 1 : 0;
  return -(indicator - exponentials[target]);
}

//TODO: handle: `return -Math.log(this.es[y]);` in learn
//# sourceMappingURL=soft-max.js.map