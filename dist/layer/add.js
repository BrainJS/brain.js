'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

exports.predict = predict;

var _kernel = require('../utilities/kernel');

var _zeros2d = require('../utilities/zeros-2d');

var _zeros2d2 = _interopRequireDefault(_zeros2d);

var _types = require('./types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function predict(inputWeights1, inputWeights2) {
  return inputWeights1[this.thread.y][this.thread.x] + inputWeights2[this.thread.y][this.thread.x];
}

var Add = function (_Operator) {
  _inherits(Add, _Operator);

  function Add(inputLayer1, inputLayer2) {
    _classCallCheck(this, Add);

    var _this = _possibleConstructorReturn(this, (Add.__proto__ || Object.getPrototypeOf(Add)).call(this));

    _this.inputLayer1 = inputLayer1;
    _this.inputLayer2 = inputLayer2;
    _this.width = _this.inputLayer1.width;
    _this.height = _this.inputLayer1.height;
    _this.validate();
    _this.weights = (0, _zeros2d2.default)(_this.width, _this.height);
    _this.deltas = (0, _zeros2d2.default)(_this.width, _this.height);
    return _this;
  }

  _createClass(Add, [{
    key: 'validate',
    value: function validate() {
      _get(Add.prototype.__proto__ || Object.getPrototypeOf(Add.prototype), 'validate', this).call(this);
      if (this.inputLayer1.width !== this.inputLayer2.width) {
        throw new Error('Layer width mismatch of ' + this.inputLayer1.width + ' and ' + this.inputLayer2.width);
      }

      if (this.inputLayer1.height !== this.inputLayer2.height) {
        throw new Error('Layer height mismatch of ' + this.inputLayer1.height + ' and ' + this.inputLayer2.height);
      }
    }
  }, {
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = (0, _kernel.makeKernel)(predict, {
        output: [this.width, this.height]
      });
    }
  }, {
    key: 'predict',
    value: function predict() {
      this.weights = this.predictKernel(this.inputLayer1.weights, this.inputLayer2.weights);
    }

    // eslint-disable-next-line

  }, {
    key: 'compare',
    value: function compare() {
      this.inputLayer1.deltas = this.deltas;
      this.inputLayer2.deltas = this.deltas;
    }
  }]);

  return Add;
}(_types.Operator);

exports.default = Add;