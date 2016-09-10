'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _matrix = require('./matrix');

var _matrix2 = _interopRequireDefault(_matrix);

var _onesMatrix = require('./matrix/ones-matrix');

var _onesMatrix2 = _interopRequireDefault(_onesMatrix);

var _copy2 = require('./matrix/copy');

var _copy3 = _interopRequireDefault(_copy2);

var _cloneNegative2 = require('./matrix/clone-negative');

var _cloneNegative3 = _interopRequireDefault(_cloneNegative2);

var _add2 = require('./matrix/add');

var _add3 = _interopRequireDefault(_add2);

var _addB2 = require('./matrix/add-b');

var _addB3 = _interopRequireDefault(_addB2);

var _allOnes2 = require('./matrix/all-ones');

var _allOnes3 = _interopRequireDefault(_allOnes2);

var _multiply2 = require('./matrix/multiply');

var _multiply3 = _interopRequireDefault(_multiply2);

var _multiplyB2 = require('./matrix/multiply-b');

var _multiplyB3 = _interopRequireDefault(_multiplyB2);

var _multiplyElement2 = require('./matrix/multiply-element');

var _multiplyElement3 = _interopRequireDefault(_multiplyElement2);

var _multiplyElementB2 = require('./matrix/multiply-element-b');

var _multiplyElementB3 = _interopRequireDefault(_multiplyElementB2);

var _relu2 = require('./matrix/relu');

var _relu3 = _interopRequireDefault(_relu2);

var _reluB2 = require('./matrix/relu-b');

var _reluB3 = _interopRequireDefault(_reluB2);

var _rowPluck2 = require('./matrix/row-pluck');

var _rowPluck3 = _interopRequireDefault(_rowPluck2);

var _rowPluckB2 = require('./matrix/row-pluck-b');

var _rowPluckB3 = _interopRequireDefault(_rowPluckB2);

var _sigmoid2 = require('./matrix/sigmoid');

var _sigmoid3 = _interopRequireDefault(_sigmoid2);

var _sigmoidB2 = require('./matrix/sigmoid-b');

var _sigmoidB3 = _interopRequireDefault(_sigmoidB2);

var _tanh2 = require('./matrix/tanh');

var _tanh3 = _interopRequireDefault(_tanh2);

var _tanhB2 = require('./matrix/tanh-b');

var _tanhB3 = _interopRequireDefault(_tanhB2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Equation = function () {
  function Equation() {
    _classCallCheck(this, Equation);

    this.inputRow = 0;
    this.states = [];
    this.previousResults = [];
    this.previousResultInputs = [];
  }

  /**
   *
   * @param {Number} size
   * @returns {Matrix}
   */


  _createClass(Equation, [{
    key: 'previousResult',
    value: function previousResult(size) {
      var into = new _matrix2.default(size, 1);
      this.previousResultInputs.push(into);
      return into;
    }

    /**
     * connects two matrices together by add
     * @param {Matrix} left
     * @param {Matrix} right
     * @returns {Matrix}
     */

  }, {
    key: 'add',
    value: function add(left, right) {
      if (left.weights.length !== right.weights.length) {
        throw new Error('misaligned matrices');
      }
      var into = new _matrix2.default(left.rows, left.columns);
      this.states.push({
        left: left,
        right: right,
        into: into,
        forwardFn: _add3.default,
        backpropagationFn: _addB3.default
      });
      return into;
    }
  }, {
    key: 'allOnes',
    value: function allOnes(rows, columns) {
      var into = new _matrix2.default(rows, columns);
      this.states.push({
        left: into,
        into: into,
        forwardFn: _allOnes3.default
      });
      return into;
    }

    /**
     *
     * @param {Matrix} m
     */

  }, {
    key: 'cloneNegative',
    value: function cloneNegative(m) {
      var into = new _matrix2.default(m.rows, m.columns);
      this.states.push({
        left: m,
        into: into,
        forwardFn: _cloneNegative3.default
      });
      return into;
    }

    /**
     * connects two matrices together by subtract
     * @param {Matrix} left
     * @param {Matrix} right
     * @returns {Matrix}
     */

  }, {
    key: 'subtract',
    value: function subtract(left, right) {
      if (left.weights.length !== right.weights.length) {
        throw new Error('misaligned matrices');
      }
      return this.add(this.add(this.allOnes(left.rows, left.columns), this.cloneNegative(left)), right);
    }

    /**
     * connects two matrices together by multiply
     * @param {Matrix} left
     * @param {Matrix} right
     * @returns {Matrix}
     */

  }, {
    key: 'multiply',
    value: function multiply(left, right) {
      if (left.columns !== right.rows) {
        throw new Error('misaligned matrices');
      }
      var into = new _matrix2.default(left.rows, right.columns);
      this.states.push({
        left: left,
        right: right,
        into: into,
        forwardFn: _multiply3.default,
        backpropagationFn: _multiplyB3.default
      });
      return into;
    }

    /**
     * connects two matrices together by multiplyElement
     * @param {Matrix} left
     * @param {Matrix} right
     * @returns {Matrix}
     */

  }, {
    key: 'multiplyElement',
    value: function multiplyElement(left, right) {
      if (left.weights.length !== right.weights.length) {
        throw new Error('misaligned matrices');
      }
      var into = new _matrix2.default(left.rows, left.columns);
      this.states.push({
        left: left,
        right: right,
        into: into,
        forwardFn: _multiplyElement3.default,
        backpropagationFn: _multiplyElementB3.default
      });
      return into;
    }

    /**
     * connects a matrix to relu
     * @param {Matrix} m
     * @returns {Matrix}
     */

  }, {
    key: 'relu',
    value: function relu(m) {
      var into = new _matrix2.default(m.rows, m.columns);
      this.states.push({
        left: m,
        into: into,
        forwardFn: _relu3.default,
        backpropagationFn: _reluB3.default
      });
      return into;
    }

    /**
     * connects a matrix via a row
     * @param {Matrix} m
     * @returns {Matrix}
     */

  }, {
    key: 'inputMatrixToRow',
    value: function inputMatrixToRow(m) {
      var self = this;
      var into = new _matrix2.default(m.columns, 1);
      this.states.push({
        left: m,
        get right() {
          return self.inputRow;
        },
        into: into,
        forwardFn: _rowPluck3.default,
        backpropagationFn: _rowPluckB3.default
      });
      return into;
    }

    /**
     * connects a matrix to sigmoid
     * @param {Matrix} m
     * @returns {Matrix}
     */

  }, {
    key: 'sigmoid',
    value: function sigmoid(m) {
      var into = new _matrix2.default(m.rows, m.columns);
      this.states.push({
        left: m,
        into: into,
        forwardFn: _sigmoid3.default,
        backpropagationFn: _sigmoidB3.default
      });
      return into;
    }

    /**
     * connects a matrix to tanh
     * @param {Matrix} m
     * @returns {Matrix}
     */

  }, {
    key: 'tanh',
    value: function tanh(m) {
      var into = new _matrix2.default(m.rows, m.columns);
      this.states.push({
        left: m,
        into: into,
        forwardFn: _tanh3.default,
        backpropagationFn: _tanhB3.default
      });
      return into;
    }
  }, {
    key: 'observe',
    value: function observe(m) {
      var iForward = 0;
      var iBackpropagate = 0;
      this.states.push({
        forwardFn: function forwardFn() {
          iForward++;
          console.log(m);
        },
        backpropagationFn: function backpropagationFn() {
          iBackpropagate++;
          console.log(m);
        }
      });
      return m;
    }

    /**
     *
     * @output {Matrix}
     */

  }, {
    key: 'run',
    value: function run(rowIndex) {
      this.inputRow = rowIndex || 0;

      var state = void 0;
      for (var i = 0, max = this.states.length; i < max; i++) {
        state = this.states[i];
        if (!state.hasOwnProperty('forwardFn')) {
          continue;
        }
        state.forwardFn(state.into, state.left, state.right);
      }

      return state.into;
    }

    /**
     * @output {Matrix}
     */

  }, {
    key: 'runBackpropagate',
    value: function runBackpropagate() {
      var i = this.states.length;
      while (i-- > 0) {
        var state = this.states[i];
        if (!state.hasOwnProperty('backpropagationFn')) {
          continue;
        }
        state.backpropagationFn(state.into, state.left, state.right);
      }
    }
  }, {
    key: 'updatePreviousResults',
    value: function updatePreviousResults() {
      for (var i = 0, max = this.previousResults.length; i < max; i++) {
        (0, _copy3.default)(this.previousResultInputs[i], this.previousResults[i]);
      }
    }
  }, {
    key: 'copyPreviousResultsTo',
    value: function copyPreviousResultsTo(equation) {
      for (var i = 0, max = this.previousResults.length; i < max; i++) {
        (0, _copy3.default)(equation.previousResultInputs[i], this.previousResults[i]);
      }
    }
  }, {
    key: 'resetPreviousResults',
    value: function resetPreviousResults() {
      for (var i = 0, max = this.previousResults.length; i < max; i++) {
        var prev = this.previousResultInputs[i];
        (0, _copy3.default)(prev, new _matrix2.default(prev.rows, 1));
      }
    }
  }, {
    key: 'addPreviousResult',
    value: function addPreviousResult(m) {
      this.previousResults.push(m);
    }
  }, {
    key: 'toFunction',
    value: function toFunction() {
      throw new Error('not yet implemented');
      /*var lookupTable = [model.input, model.hiddenLayers, model.outputConnector, model.output];
      var hiddenLayers = this.model.hiddenLayers;
      for (var i = 0, max = hiddenLayers.length; i < max; i++) {
        var hiddenLayer = hiddenLayers[i];
        for (var p in hiddenLayer) {
          lookupTable.push(hiddenLayer[p]);
        }
      }
       var fowardFunctionList = [];
      for (var i = 0, max = this.states.length; i++) {
        var state = this.states[i];
        if (!state.forwardFn) continue;
        if (fowardFunctionList.indexOf(state.forwardFn) > -1) continue;
        fowardFunctionList.push(state.forwardFn);
      }
       var connectorMatrices = [];
      for (var i = 0, max = this.states.length; i++) {
        var state = this.states[i];
        if (!state.into) continue;
        if (connectorMatrices.indexOf(state.into) > -1) continue;
        connectorMatrices.push(state.into);
      }
       return new Function('rowIndex', '\
      inputRow = rowIndex || 0;\
      \
        for (var i = 0, max = this.states.length; i < max; i++) {\
        var state = this.states[i];\
        if (!state.hasOwnProperty(\'forwardFn\')) {\
          continue;\
        }\
        state.forwardFn(state.into, state.left, state.right);\
      }\
      \
      return state.into;\
      ');*/
    }
  }, {
    key: 'toFunctionStates',
    value: function toFunctionStates() {}
  }]);

  return Equation;
}();

exports.default = Equation;
//# sourceMappingURL=equation.js.map