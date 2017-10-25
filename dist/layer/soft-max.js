'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SoftMax = function (_Base) {
  _inherits(SoftMax, _Base);

  function SoftMax(settings, inputLayer) {
    _classCallCheck(this, SoftMax);

    var _this = _possibleConstructorReturn(this, (SoftMax.__proto__ || Object.getPrototypeOf(SoftMax)).call(this, settings));

    _this.inputLayer = inputLayer;
    return _this;
  }

  return SoftMax;
}(_base2.default);

exports.default = SoftMax;


function getMaxInput(inputs) {
  var maxInput = -Infinity;
  for (var z = 0; z < this.constants.inputDepth; z++) {
    for (var y = 0; y < this.constants.inputHeight; y++) {
      for (var x = 0; x < this.constants.inputWidth; x++) {
        var input = inputs[z][y][x];
        if (input > maxInput) {
          maxInput = input;
        }
      }
    }
  }
  return maxInput;
}

function getExponentialSum(inputs, maxInput) {
  var exponentialSum = 0;
  for (var z = 0; z < this.constants.inputDepth; z++) {
    for (var y = 0; y < this.constants.inputHeight; y++) {
      for (var x = 0; x < this.constants.inputWidth; x++) {
        exponentialSum += Math.exp(inputs[z][y][x] - maxInput);
      }
    }
  }
  return exponentialSum;
}

function getExponential(inputs, maxInput) {
  return Math.exp(inputs[this.thread.z][this.thread.y][this.thread.x] - maxInput);
}

function predict(exponentials, exponentialSum) {
  return exponentials[this.thread.z][this.thread.y][this.thread.x] /= exponentialSum;
}

function learn(target, exponentials) {
  var indicator = this.thread.x === target ? 1 : 0;
  return -(indicator - exponentials[target]);
}

//TODO: handle: `return -Math.log(this.es[y]);` in learn
//# sourceMappingURL=soft-max.js.map