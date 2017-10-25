'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LSTM = function (_Group) {
  _inherits(LSTM, _Group);

  function LSTM(settings) {
    _classCallCheck(this, LSTM);

    var _this = _possibleConstructorReturn(this, (LSTM.__proto__ || Object.getPrototypeOf(LSTM)).call(this, settings));

    _this.inputGate = new LSTMCell();
    _this.forgetGate = new LSTMCell();
    _this.outputGate = new LSTMCell();
    _this.memory = new LSTMCell();
    return _this;
  }

  _createClass(LSTM, null, [{
    key: 'createKernel',
    value: function createKernel(settings) {
      return function (layer, inputLayer, previousOutputs) {
        var inputGate = (0, _index.sigmoid)((0, _index.add)((0, _index.add)((0, _index.multiply)(layer.inputGate.inputWeights, inputLayer), (0, _index.multiply)(layer.inputGate.peepholeWeights, previousOutputs)), layer.inputGate.bias));

        var forgetGate = (0, _index.sigmoid)((0, _index.add)((0, _index.add)((0, _index.multiply)(layer.forgetGate.inputWeights, inputLayer), (0, _index.multiply)(layer.forgetGate.peepholeWeights, previousOutputs)), layer.forgetGate.bias));

        // output gate
        var outputGate = (0, _index.sigmoid)((0, _index.add)((0, _index.add)((0, _index.multiply)(layer.outputGate.inputWeights, inputLayer), (0, _index.multiply)(layer.outputGate.peepholeWeights, previousOutputs)), layer.outputGate.bias));

        // write operation on cells
        var memory = (0, _index.tanh)((0, _index.add)((0, _index.add)((0, _index.multiply)(layer.memory.inputWeights, inputLayer), (0, _index.multiply)(layer.memory.peepholeWeights, previousOutputs)), layer.memory.bias));

        // compute new cell activation
        var retainCell = (0, _index.multiplyElement)(forgetGate, inputLayer); // what do we keep from cell
        var writeCell = (0, _index.multiplyElement)(inputGate, memory); // what do we write to cell
        var cell = (0, _index.add)(retainCell, writeCell); // new cell contents

        // compute hidden state as gated, saturated cell activations
        return (0, _index.multiplyElement)(outputGate, (0, _index.tanh)(cell));
      };
    }
  }]);

  return LSTM;
}(_base2.default);

exports.default = LSTM;

var LSTMCell = function LSTMCell() {
  _classCallCheck(this, LSTMCell);

  this.inputWeights = {};
  this.peepholeWeights = {};
  this.bias = {};
};
//# sourceMappingURL=lstm.js.map