'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Regression = function (_Base) {
  _inherits(Regression, _Base);

  function Regression() {
    _classCallCheck(this, Regression);

    return _possibleConstructorReturn(this, (Regression.__proto__ || Object.getPrototypeOf(Regression)).apply(this, arguments));
  }

  _createClass(Regression, [{
    key: 'predict',
    value: function predict() {
      this.weights = this.inputs;
      this.validate();
    }
  }, {
    key: 'learn',
    value: function learn() {}
  }]);

  return Regression;
}(_base2.default);

function learn(target) {
  // if(y === i) { continue; }
  // var ydiff = -yscore + x.w[i] + margin;
  // if(ydiff > 0) {
  //   // violating dimension, apply loss
  //   x.dw[i] += 1;
  //   x.dw[y] -= 1;
  //   loss += ydiff;
  // }
}
//# sourceMappingURL=svm.js.map