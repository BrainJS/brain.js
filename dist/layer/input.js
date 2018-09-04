'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _types = require('./types');

var _zeros2d = require('../utilities/zeros-2d');

var _zeros2d2 = _interopRequireDefault(_zeros2d);

var _kernel = require('../utilities/kernel');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Input = function (_Model) {
  _inherits(Input, _Model);

  function Input(settings) {
    _classCallCheck(this, Input);

    var _this = _possibleConstructorReturn(this, (Input.__proto__ || Object.getPrototypeOf(Input)).call(this, settings));

    if (_this.width === 1) {
      _this.predict = _this.predict1D;
    }
    _this.validate();
    _this.weights = null;
    _this.deltas = (0, _zeros2d2.default)(_this.width, _this.height);
    return _this;
  }

  _createClass(Input, [{
    key: 'setupKernels',
    value: function setupKernels() {}
  }, {
    key: 'predict',
    value: function predict(inputs) {
      if (inputs.length === this.height * this.width) {
        this.weights = (0, _kernel.kernelInput)(inputs, [this.width, this.height]);
      } else if (inputs.length === this.height && inputs[0].length === this.width) {
        this.weights = inputs;
      } else {
        throw new Error('Inputs are not of sized correctly');
      }
    }
  }, {
    key: 'predict1D',
    value: function predict1D(inputs) {
      var weights = [];
      for (var x = 0; x < inputs.length; x++) {
        weights.push([inputs[x]]);
      }
      this.weights = weights;
    }
  }, {
    key: 'compare',
    value: function compare() {
      // throw new Error(`${this.constructor.name}-compare is not yet implemented`)
    }
  }, {
    key: 'learn',
    value: function learn() {
      this.deltas = (0, _zeros2d2.default)(this.width, this.height);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var jsonLayer = {};
      var _constructor = this.constructor,
          defaults = _constructor.defaults,
          name = _constructor.name;

      var keys = Object.keys(defaults);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];

        if (key === 'deltas' || key === 'weights') continue;
        jsonLayer[key] = this[key];
      }
      jsonLayer.type = name;
      return jsonLayer;
    }
  }]);

  return Input;
}(_types.Model);

exports.default = Input;