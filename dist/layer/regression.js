'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Regression = function (_Base) {
  _inherits(Regression, _Base);

  function Regression(settings) {
    _classCallCheck(this, Regression);

    var _this = _possibleConstructorReturn(this, (Regression.__proto__ || Object.getPrototypeOf(Regression)).call(this, settings));

    _this.validate();
    return _this;
  }

  _createClass(Regression, [{
    key: 'predict',
    value: function predict() {
      this.weights = this.inputs;
    }
  }, {
    key: 'learn',
    value: function learn() {
      // throw new Error(`${this.constructor.name}-learn is not yet implemented`)
    }
  }]);

  return Regression;
}(_base2.default);

exports.default = Regression;


function learn(inputs, targets) {
  return inputs[this.thread.x] - targets[this.thread.x];
}

// TODO: handle `loss += 0.5*dy*dy;` total and sum in learn