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

var LSTM = function (_RNN) {
  _inherits(LSTM, _RNN);

  function LSTM() {
    _classCallCheck(this, LSTM);

    return _possibleConstructorReturn(this, (LSTM.__proto__ || Object.getPrototypeOf(LSTM)).apply(this, arguments));
  }

  _createClass(LSTM, [{
    key: 'getModel',
    value: function getModel(hiddenSize, prevSize) {
      return {
        // gates parameters
        //wix
        inputMatrix: new _randomMatrix2.default(hiddenSize, prevSize, 0.08),
        //wih
        inputHidden: new _randomMatrix2.default(hiddenSize, hiddenSize, 0.08),
        //bi
        inputBias: new _matrix2.default(hiddenSize, 1),

        //wfx
        forgetMatrix: new _randomMatrix2.default(hiddenSize, prevSize, 0.08),
        //wfh
        forgetHidden: new _randomMatrix2.default(hiddenSize, hiddenSize, 0.08),
        //bf
        forgetBias: new _matrix2.default(hiddenSize, 1),

        //wox
        outputMatrix: new _randomMatrix2.default(hiddenSize, prevSize, 0.08),
        //woh
        outputHidden: new _randomMatrix2.default(hiddenSize, hiddenSize, 0.08),
        //bo
        outputBias: new _matrix2.default(hiddenSize, 1),

        // cell write params
        //wcx
        cellActivationMatrix: new _randomMatrix2.default(hiddenSize, prevSize, 0.08),
        //wch
        cellActivationHidden: new _randomMatrix2.default(hiddenSize, hiddenSize, 0.08),
        //bc
        cellActivationBias: new _matrix2.default(hiddenSize, 1)
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

      var inputGate = sigmoid(add(add(multiply(hiddenLayer.inputMatrix, inputMatrix), multiply(hiddenLayer.inputHidden, previousResult)), hiddenLayer.inputBias));

      var forgetGate = sigmoid(add(add(multiply(hiddenLayer.forgetMatrix, inputMatrix), multiply(hiddenLayer.forgetHidden, previousResult)), hiddenLayer.forgetBias));

      // output gate
      var outputGate = sigmoid(add(add(multiply(hiddenLayer.outputMatrix, inputMatrix), multiply(hiddenLayer.outputHidden, previousResult)), hiddenLayer.outputBias));

      // write operation on cells
      var cellWrite = tanh(add(add(multiply(hiddenLayer.cellActivationMatrix, inputMatrix), multiply(hiddenLayer.cellActivationHidden, previousResult)), hiddenLayer.cellActivationBias));

      // compute new cell activation
      var retainCell = multiplyElement(forgetGate, previousResult); // what do we keep from cell
      var writeCell = multiplyElement(inputGate, cellWrite); // what do we write to cell
      var cell = add(retainCell, writeCell); // new cell contents

      // compute hidden state as gated, saturated cell activations
      return multiplyElement(outputGate, tanh(cell));
    }
  }]);

  return LSTM;
}(_rnn2.default);

exports.default = LSTM;
//# sourceMappingURL=lstm.js.map