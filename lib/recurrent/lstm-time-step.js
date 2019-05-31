'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _matrix = require('./matrix');

var _matrix2 = _interopRequireDefault(_matrix);

var _lstm = require('./lstm');

var _lstm2 = _interopRequireDefault(_lstm);

var _rnnTimeStep = require('./rnn-time-step');

var _rnnTimeStep2 = _interopRequireDefault(_rnnTimeStep);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LSTMTimeStep = function (_RNNTimeStep) {
  _inherits(LSTMTimeStep, _RNNTimeStep);

  function LSTMTimeStep() {
    _classCallCheck(this, LSTMTimeStep);

    return _possibleConstructorReturn(this, (LSTMTimeStep.__proto__ || Object.getPrototypeOf(LSTMTimeStep)).apply(this, arguments));
  }

  _createClass(LSTMTimeStep, [{
    key: 'getModel',
    value: function getModel(hiddenSize, prevSize) {
      return _lstm2.default.prototype.getModel.call(this, hiddenSize, prevSize);
    }

    /**
     *
     * @param {Equation} equation
     * @param {Matrix} inputMatrix
     * @param {Matrix} previousResult
     * @param {Object} hiddenLayer
     * @returns {Matrix}
     */

  }, {
    key: 'getEquation',
    value: function getEquation(equation, inputMatrix, previousResult, hiddenLayer) {
      return _lstm2.default.prototype.getEquation.call(this, equation, inputMatrix, previousResult, hiddenLayer);
    }
  }]);

  return LSTMTimeStep;
}(_rnnTimeStep2.default);

exports.default = LSTMTimeStep;