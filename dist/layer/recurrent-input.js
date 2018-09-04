'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _types = require('./types');

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // import zeros2D from '../utilities/zeros-2d'


var RecurrentInput = function (_Internal) {
  _inherits(RecurrentInput, _Internal);

  function RecurrentInput() {
    _classCallCheck(this, RecurrentInput);

    return _possibleConstructorReturn(this, (RecurrentInput.__proto__ || Object.getPrototypeOf(RecurrentInput)).apply(this, arguments));
  }

  _createClass(RecurrentInput, [{
    key: 'setRecurrentInput',
    value: function setRecurrentInput(recurrentInput) {
      this.recurrentInput = recurrentInput;
      this.validate();
    }
  }, {
    key: 'validate',
    value: function validate() {
      _base2.default.prototype.validate.call(this);
      if (this.width !== this.recurrentInput.width) {
        throw new Error(this.constructor.name + ' layer width ' + this.width + ' and ' + this.recurrentInput.constructor.name + ' width (' + this.recurrentInput.width + ') are not same');
      }

      if (this.height !== this.recurrentInput.height) {
        throw new Error(this.constructor.name + ' layer height ' + this.height + ' and ' + this.recurrentInput.constructor.name + ' width (' + this.recurrentInput.height + ') are not same');
      }
    }
  }, {
    key: 'setDimensions',
    value: function setDimensions(width, height) {
      this.width = width;
      this.height = height;
    }
  }, {
    key: 'predict',
    value: function predict() {
      // throw new Error(`${this.constructor.name}-predict is not yet implemented`)
    }
  }, {
    key: 'compare',
    value: function compare() {
      // throw new Error(`${this.constructor.name}-compare is not yet implemented`)
    }
  }, {
    key: 'learn',
    value: function learn() {
      // throw new Error(`${this.constructor.name}-learn is not yet implemented`)
    }
  }, {
    key: 'setupKernels',
    value: function setupKernels() {
      // throw new Error(
      //   `${this.constructor.name}-setupKernels is not yet implemented`
      // )
    }
  }, {
    key: 'reuseKernels',
    value: function reuseKernels() {
      // throw new Error(
      //   `${this.constructor.name}-reuseKernels is not yet implemented`
      // )
    }
  }, {
    key: 'deltas',
    get: function get() {
      return this.recurrentInput.deltas;
    },
    set: function set(deltas) {
      this.recurrentInput.deltas = deltas;
    }
  }, {
    key: 'weights',
    get: function get() {
      return this.recurrentInput.weights;
    },
    set: function set(weights) {
      this.recurrentInput.weights = weights;
    }
  }]);

  return RecurrentInput;
}(_types.Internal);

exports.default = RecurrentInput;