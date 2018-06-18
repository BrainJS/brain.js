'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.predict = predict;
exports.compare = compare;

var _types = require('./types');

var _makeKernel = require('../utilities/make-kernel');

var _makeKernel2 = _interopRequireDefault(_makeKernel);

var _layerSetup = require('../utilities/layer-setup');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Pool = function (_Filter) {
  _inherits(Pool, _Filter);

  _createClass(Pool, null, [{
    key: 'defaults',
    get: function get() {
      return {
        padding: 0,
        bias: 0,
        filterWidth: 0,
        filterHeight: 0
      };
    }
  }]);

  function Pool(settings, inputLayer) {
    _classCallCheck(this, Pool);

    var _this = _possibleConstructorReturn(this, (Pool.__proto__ || Object.getPrototypeOf(Pool)).call(this, settings));

    _this.inputLayer = inputLayer;

    (0, _layerSetup.setPadding)(_this, settings);

    _this.switchX = null;
    _this.switchY = null;
    _this.validate();
    return _this;
  }

  _createClass(Pool, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = (0, _makeKernel2.default)(predict, {
        output: [this.width, this.height, this.depth],
        map: {
          switchX: setSwitchX,
          switchY: setSwitchY
        },
        constants: {
          inputWidth: this.inputLayer.width,
          inputHeight: this.inputLayer.height,
          paddingX: this.paddingX,
          paddingY: this.paddingY,
          filterHeight: this.filterHeight,
          filterWidth: this.filterWidth
        }
      });

      this.compareKernel = (0, _makeKernel2.default)(compare, {
        output: [this.width, this.height, this.depth],
        constants: {
          outputWidth: this.width,
          outputHeight: this.height,
          paddingX: this.paddingX,
          paddingY: this.paddingY
        }
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      var weights = this.predictKernel(this.inputLayer.weights);
      this.switchX = weights.switchX;
      this.switchY = weights.switchY;
      return this.weights = weights.result;
    }
  }, {
    key: 'compare',
    value: function compare() {
      this.inputLayer.deltas = this.compareKernel(this.deltas, this.switchX, this.switchY);
    }
  }]);

  return Pool;
}(_types.Filter);

exports.default = Pool;
function predict(inputs) {
  var x = this.thread.x / this.output.x * this.constants.inputWidth - this.constants.paddingX;
  var y = this.thread.y / this.output.y * this.constants.inputHeight - this.constants.paddingY;
  var largestValue = -Infinity;
  var largestX = -1;
  var largestY = -1;

  // convolve centered at this particular location
  for (var filterY = 0; filterY < this.constants.filterHeight; filterY++) {
    // coordinates in the original input array coordinates
    var inputY = filterY + y;
    for (var filterX = 0; filterX < this.constants.filterWidth; filterX++) {
      var inputX = filterX + x;
      if (inputY >= 0 && inputY < this.constants.inputHeight && inputX >= 0 && inputX < this.constants.inputWidth) {
        var input = inputs[this.output.z][inputY][inputX];
        if (input > largestValue) {
          largestValue = input;
          largestY = inputY;
          largestX = inputX;
        }
      }
    }
  }
  setSwitchY(largestY);
  setSwitchX(largestX);
  return largestValue;
}

function setSwitchY(value) {
  return value;
}

function setSwitchX(value) {
  return value;
}

function compare(deltas, switchY, switchX) {
  var x = Math.floor(this.thread.x / this.output.x * this.constants.outputWidth - this.constants.paddingX);
  var y = Math.floor(this.thread.y / this.output.y * this.constants.outputHeight - this.constants.paddingY);
  var deltaXIndex = switchX[y][x];
  var deltaYIndex = switchY[y][x];

  if (deltaXIndex !== this.thread.y) return 0;
  if (deltaYIndex !== this.thread.x) return 0;

  return deltas[y][x];
}
//# sourceMappingURL=pool.js.map