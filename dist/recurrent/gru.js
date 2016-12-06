'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _matrix = require('./matrix');

var _matrix2 = _interopRequireDefault(_matrix);

var _randomMatrix = require('./matrix/random-matrix');

var _randomMatrix2 = _interopRequireDefault(_randomMatrix);

var _rnn = require('./rnn');

var _rnn2 = _interopRequireDefault(_rnn);

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
        // update Gate
        //wzxh
        updateGateInputMatrix: new _randomMatrix2.default(hiddenSize, prevSize, 0.08),
        //wzhh
        updateGateHiddenMatrix: new _randomMatrix2.default(hiddenSize, hiddenSize, 0.08),
        //bz
        updateGateBias: new _matrix2.default(hiddenSize, 1),

        // reset Gate
        //wrxh
        resetGateInputMatrix: new _randomMatrix2.default(hiddenSize, prevSize, 0.08),
        //wrhh
        resetGateHiddenMatrix: new _randomMatrix2.default(hiddenSize, hiddenSize, 0.08),
        //br
        resetGateBias: new _matrix2.default(hiddenSize, 1),

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
     * @param {Matrix} previousResult
     * @param {Object} hiddenLayer
     * @returns {Matrix}
     */

  }, {
    key: 'getEquation',
    value: function getEquation(equation, inputMatrix, previousResult, hiddenLayer) {
      var sigmoid = equation.sigmoid.bind(equation);
      var add = equation.add.bind(equation);
      var multiply = equation.multiply.bind(equation);
      var multiplyElement = equation.multiplyElement.bind(equation);
      var tanh = equation.tanh.bind(equation);
      var allOnes = equation.allOnes.bind(equation);
      var cloneNegative = equation.cloneNegative.bind(equation);

      // update gate
      var updateGate = sigmoid(add(add(multiply(hiddenLayer.updateGateInputMatrix, inputMatrix), multiply(hiddenLayer.updateGateHiddenMatrix, previousResult)), hiddenLayer.updateGateBias));

      // reset gate
      var resetGate = sigmoid(add(add(multiply(hiddenLayer.resetGateInputMatrix, inputMatrix), multiply(hiddenLayer.resetGateHiddenMatrix, previousResult)), hiddenLayer.resetGateBias));

      // cell
      var cell = tanh(add(add(multiply(hiddenLayer.cellWriteInputMatrix, inputMatrix), multiply(hiddenLayer.cellWriteHiddenMatrix, multiplyElement(resetGate, previousResult))), hiddenLayer.cellWriteBias));

      // compute hidden state as gated, saturated cell activations
      // negate updateGate
      return add(multiplyElement(add(allOnes(updateGate.rows, updateGate.columns), cloneNegative(updateGate)), cell), multiplyElement(previousResult, updateGate));
    }
  }]);

  return GRU;
}(_rnn2.default);

exports.default = GRU;
//# sourceMappingURL=gru.js.map