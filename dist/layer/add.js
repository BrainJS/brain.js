'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.predict = predict;

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _makeKernel = require('../utilities/make-kernel');

var _makeKernel2 = _interopRequireDefault(_makeKernel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Add = function (_Base) {
  _inherits(Add, _Base);

  function Add(inputLayers) {
    _classCallCheck(this, Add);

    var _this = _possibleConstructorReturn(this, (Add.__proto__ || Object.getPrototypeOf(Add)).call(this));

    if (inputLayers[0].width !== inputLayers[1].width) {
      throw new Error('Layer width mismatch');
    }

    if (inputLayers[0].height !== inputLayers[1].height) {
      throw new Error('Layer height mismatch');
    }

    _this.width = inputLayers[0].width;
    _this.height = inputLayers[0].height;

    _this.inputLayers = inputLayers;
    return _this;
  }

  _createClass(Add, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = (0, _makeKernel2.default)(predict, {
        output: [this.width, this.height]
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      this.outputs = this.predictKernel(this.inputLayers[0].outputs, this.inputLayers[1].outputs);
    }
  }, {
    key: 'learn',
    value: function learn(previousLayer, nextLayer) {
      this.deltas = nextLayer.deltas;
    }
  }]);

  return Add;
}(_base2.default);

exports.default = Add;
function predict(inputs1, inputs2) {
  return inputs1[this.thread.y][this.thread.x] + inputs2[this.thread.y][this.thread.x];
}
//# sourceMappingURL=add.js.map