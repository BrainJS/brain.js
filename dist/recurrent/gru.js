'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _matrix = require('./matrix');

var _matrix2 = _interopRequireDefault(_matrix);

var _rnn = require('./rnn');

var _rnn2 = _interopRequireDefault(_rnn);

var _randomMatrix = require('./matrix/random-matrix');

var _randomMatrix2 = _interopRequireDefault(_randomMatrix);

var _onesMatrix = require('./matrix/ones-matrix');

var _onesMatrix2 = _interopRequireDefault(_onesMatrix);

var _cloneNegative = require('./matrix/clone-negative');

var _cloneNegative2 = _interopRequireDefault(_cloneNegative);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GRU = function (_RNN) {
  _inherits(GRU, _RNN);

  function GRU() {
    _classCallCheck(this, GRU);

    return _possibleConstructorReturn(this, (GRU.__proto__ || Object.getPrototypeOf(GRU)).apply(this, arguments));
  }

  _createClass(GRU, [{
    key: 'getModel',
    value: function getModel(hiddenSize, prevSize) {
      return {
        // reset Gate
        //wrxh
        resetGateInputMatrix: new _randomMatrix2.default(hiddenSize, prevSize, 0.08),
        //wrhh
        resetGateHiddenMatrix: new _randomMatrix2.default(hiddenSize, hiddenSize, 0.08),
        //br
        resetGateBias: new _matrix2.default(hiddenSize, 1),

        // update Gate
        //wzxh
        updateGateInputMatrix: new _randomMatrix2.default(hiddenSize, prevSize, 0.08),
        //wzhh
        updateGateHiddenMatrix: new _randomMatrix2.default(hiddenSize, hiddenSize, 0.08),
        //bz
        updateGateBias: new _matrix2.default(hiddenSize, 1),

        // cell write parameters
        //wcxh
        cellWriteInputMatrix: new _randomMatrix2.default(hiddenSize, prevSize, 0.08),
        //wchh
        cellWriteHiddenMatrix: new _randomMatrix2.default(hiddenSize, hiddenSize, 0.08),
        //bc
        cellWriteBias: new _matrix2.default(hiddenSize, 1)
      };
    }

    /**
     *
     * @param {Equation} equation
     * @param {Matrix} inputMatrix
     * @param {Number} size
     * @param {Object} hiddenLayer
     * @returns {Matrix}
     */

  }, {
    key: 'getEquation',
    value: function getEquation(equation, inputMatrix, size, hiddenLayer) {
      var sigmoid = equation.sigmoid.bind(equation);
      var add = equation.add.bind(equation);
      var multiply = equation.multiply.bind(equation);
      var multiplyElement = equation.multiplyElement.bind(equation);
      var previousResult = equation.previousResult.bind(equation);
      var tanh = equation.tanh.bind(equation);

      // reset gate
      var resetGate = sigmoid(add(add(multiply(hiddenLayer.resetGateInputMatrix, inputMatrix), multiply(hiddenLayer.resetGateHiddenMatrix, previousResult(size))), hiddenLayer.resetGateBias));

      // update gate
      var updateGate = sigmoid(add(add(multiply(hiddenLayer.updateGateInputMatrix, inputMatrix), multiply(hiddenLayer.updateGateHiddenMatrix, previousResult(size))), hiddenLayer.updateGateBias));

      // cell
      var cell = tanh(add(add(multiply(hiddenLayer.cellWriteInputMatrix, inputMatrix), multiply(hiddenLayer.cellWriteHiddenMatrix, multiplyElement(resetGate, previousResult(size)))), hiddenLayer.cellWriteBias));

      // compute hidden state as gated, saturated cell activations
      var allOnes = new _onesMatrix2.default(updateGate.rows, updateGate.columns);
      // negate updateGate
      var negUpdateGate = (0, _cloneNegative2.default)(updateGate);
      return add(multiplyElement(add(allOnes, negUpdateGate), cell), multiplyElement(previousResult(size), updateGate));
    }
  }]);

  return GRU;
}(_rnn2.default);

exports.default = GRU;
//# sourceMappingURL=gru.js.map