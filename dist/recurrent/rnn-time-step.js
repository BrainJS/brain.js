'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _matrix = require('./matrix');

var _matrix2 = _interopRequireDefault(_matrix);

var _randomMatrix = require('./matrix/random-matrix');

var _randomMatrix2 = _interopRequireDefault(_randomMatrix);

var _equation = require('./matrix/equation');

var _equation2 = _interopRequireDefault(_equation);

var _rnn = require('./rnn');

var _rnn2 = _interopRequireDefault(_rnn);

var _zeros = require('../utilities/zeros');

var _zeros2 = _interopRequireDefault(_zeros);

var _softmax = require('./matrix/softmax');

var _softmax2 = _interopRequireDefault(_softmax);

var _random = require('../utilities/random');

var _sampleI = require('./matrix/sample-i');

var _sampleI2 = _interopRequireDefault(_sampleI);

var _maxI = require('./matrix/max-i');

var _maxI2 = _interopRequireDefault(_maxI);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RNNTimeStep = function (_RNN) {
  _inherits(RNNTimeStep, _RNN);

  function RNNTimeStep() {
    _classCallCheck(this, RNNTimeStep);

    return _possibleConstructorReturn(this, (RNNTimeStep.__proto__ || Object.getPrototypeOf(RNNTimeStep)).apply(this, arguments));
  }

  _createClass(RNNTimeStep, [{
    key: 'createInputMatrix',
    value: function createInputMatrix() {
      this.model.input = new _randomMatrix2.default(this.inputSize, 1, 0.08);
    }
  }, {
    key: 'createOutputMatrix',
    value: function createOutputMatrix() {
      var model = this.model;
      var outputSize = this.outputSize;
      var lastHiddenSize = this.hiddenLayers[this.hiddenLayers.length - 1];

      //whd
      model.outputConnector = new _randomMatrix2.default(outputSize, lastHiddenSize, 0.08);
      //bd
      model.output = new _matrix2.default(outputSize, 1);
    }
  }, {
    key: 'bindEquation',
    value: function bindEquation() {
      var model = this.model;
      var hiddenLayers = this.hiddenLayers;
      var layers = model.hiddenLayers;
      var equation = new _equation2.default();
      var outputs = [];
      var equationConnection = model.equationConnections.length > 0 ? model.equationConnections[model.equationConnections.length - 1] : this.initialLayerInputs;

      // 0 index
      var output = this.getEquation(equation, equation.input(model.input), equationConnection[0], layers[0]);
      outputs.push(output);
      // 1+ indices
      for (var i = 1, max = hiddenLayers.length; i < max; i++) {
        output = this.getEquation(equation, output, equationConnection[i], layers[i]);
        outputs.push(output);
      }

      model.equationConnections.push(outputs);
      equation.add(equation.multiply(model.outputConnector, output), model.output);
      model.equations.push(equation);
    }

    /**
     *
     * @param {Number[]} input
     * @returns {number}
     */

  }, {
    key: 'runInput',
    value: function runInput(input) {
      this.runs++;
      var model = this.model;
      var errorSum = 0;
      var equation = void 0;
      while (model.equations.length < input.length - 1) {
        this.bindEquation();
      }
      var outputs = [];

      if (this.inputSize === 1) {
        for (var inputIndex = 0, max = input.length - 1; inputIndex < max; inputIndex++) {
          // start and end tokens are zeros
          equation = model.equations[inputIndex];

          var current = input[inputIndex];
          var next = input[inputIndex + 1];
          var output = equation.runInput([current]);
          for (var i = 0; i < output.weights.length; i++) {
            var error = output.weights[i] - next;
            // set gradients into log probabilities
            errorSum += Math.abs(error);

            // write gradients into log probabilities
            output.deltas[i] = error;
            outputs.push(output.weights);
          }
        }
      } else {
        for (var _inputIndex = 0, _max = input.length - 1; _inputIndex < _max; _inputIndex++) {
          // start and end tokens are zeros
          equation = model.equations[_inputIndex];

          var _current = input[_inputIndex];
          var _next = input[_inputIndex + 1];
          var _output = equation.runInput(_current);
          for (var _i = 0; _i < _output.weights.length; _i++) {
            var _error = _output.weights[_i] - _next[_i];
            // set gradients into log probabilities
            errorSum += Math.abs(_error);

            // write gradients into log probabilities
            _output.deltas[_i] = _error;
            outputs.push(_output.weights);
          }
        }
      }
      //this.model.equations.length - 1;
      this.totalCost = errorSum;
      return errorSum;
    }
  }, {
    key: 'runBackpropagate',
    value: function runBackpropagate() {
      for (var i = this.model.equations.length - 1; i > -1; i--) {
        this.model.equations[i].runBackpropagate();
      }
    }

    /**
     *
     * @param {Number[]|Number[][]} [input]
     * @returns {Number[]|Number}
     */

  }, {
    key: 'run',
    value: function run() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (!this.isRunnable) return null;
      var model = this.model;
      while (model.equations.length < input.length) {
        this.bindEquation();
      }
      var lastOutput = void 0;
      if (this.inputSize === 1) {
        for (var i = 0; i < input.length; i++) {
          var outputMatrix = model.equations[i].runInput([input[i]]);
          lastOutput = outputMatrix.weights;
        }
      } else {
        for (var _i2 = 0; _i2 < input.length; _i2++) {
          var _outputMatrix = model.equations[_i2].runInput(input[_i2]);
          lastOutput = _outputMatrix.weights;
        }
      }
      if (this.outputSize === 1) {
        return lastOutput[0];
      }
      return lastOutput;
    }

    /**
     *
     * @returns {Function}
     */

  }, {
    key: 'toFunction',
    value: function toFunction() {
      var model = this.model;
      var equations = this.model.equations;
      var inputSize = this.inputSize;
      debugger;
      var equation = equations[1];
      var states = equation.states;
      var jsonString = JSON.stringify(this.toJSON());

      function matrixOrigin(m, stateIndex) {
        for (var i = 0, max = states.length; i < max; i++) {
          var state = states[i];

          if (i === stateIndex) {
            var j = previousConnectionIndex(m);
            switch (m) {
              case state.left:
                if (j > -1) {
                  return 'typeof prevStates[' + j + '] === \'object\' ? prevStates[' + j + '].product : new Matrix(' + m.rows + ', ' + m.columns + ')';
                }
              case state.right:
                if (j > -1) {
                  return 'typeof prevStates[' + j + '] === \'object\' ? prevStates[' + j + '].product : new Matrix(' + m.rows + ', ' + m.columns + ')';
                }
              case state.product:
                return 'new Matrix(' + m.rows + ', ' + m.columns + ')';
              default:
                throw Error('unknown state');
            }
          }

          if (m === state.product) return 'states[' + i + '].product';
          if (m === state.right) return 'states[' + i + '].right';
          if (m === state.left) return 'states[' + i + '].left';
        }
      }

      function previousConnectionIndex(m) {
        var connection = model.equationConnections[0];
        var states = equations[0].states;
        for (var i = 0, max = states.length; i < max; i++) {
          if (states[i].product === m) {
            return i;
          }
        }
        return connection.indexOf(m);
      }

      function matrixToString(m, stateIndex) {
        if (!m || !m.rows || !m.columns) return 'null';

        if (m === model.input) return 'json.input';
        if (m === model.outputConnector) return 'json.outputConnector';
        if (m === model.output) return 'json.output';

        for (var i = 0, max = model.hiddenLayers.length; i < max; i++) {
          var hiddenLayer = model.hiddenLayers[i];
          for (var p in hiddenLayer) {
            if (!hiddenLayer.hasOwnProperty(p)) continue;
            if (hiddenLayer[p] !== m) continue;
            return 'json.hiddenLayers[' + i + '].' + p;
          }
        }

        return matrixOrigin(m, stateIndex);
      }

      function toInner(fnString) {
        // crude, but should be sufficient for now
        // function() { body }
        fnString = fnString.toString().split('{');
        fnString.shift();
        // body }
        fnString = fnString.join('{');
        fnString = fnString.split('}');
        fnString.pop();
        // body

        return fnString.join('}').split('\n').join('\n        ').replace('product.weights = _this.inputValue;', inputSize === 1 ? 'product.weights = [input[_i]];' : 'product.weights = input[_i];').replace('product.deltas[i] = 0;', '').replace('product.deltas[column] = 0;', '').replace('left.deltas[leftIndex] = 0;', '').replace('right.deltas[rightIndex] = 0;', '').replace('product.deltas = left.deltas.slice(0);', '');
      }

      function fileName(fnName) {
        return 'src/recurrent/matrix/' + fnName.replace(/[A-Z]/g, function (value) {
          return '-' + value.toLowerCase();
        }) + '.js';
      }

      var statesRaw = [];
      var usedFunctionNames = {};
      var innerFunctionsSwitch = [];
      for (var i = 0, max = states.length; i < max; i++) {
        var state = states[i];
        statesRaw.push('states[' + i + '] = {\n      name: \'' + state.forwardFn.name + '\',\n      left: ' + matrixToString(state.left, i) + ',\n      right: ' + matrixToString(state.right, i) + ',\n      product: ' + matrixToString(state.product, i) + '\n    }');

        var fnName = state.forwardFn.name;
        if (!usedFunctionNames[fnName]) {
          usedFunctionNames[fnName] = true;
          innerFunctionsSwitch.push('        case \'' + fnName + '\':' + (fnName !== 'forwardFn' ? ' //compiled from ' + fileName(fnName) : '') + '\n          ' + toInner(state.forwardFn.toString()) + '\n          break;');
        }
      }

      var src = '\n  if (typeof rawInput === \'undefined\') rawInput = [];\n  ' + (this.dataFormatter !== null ? this.dataFormatter.toFunctionString() : '') + '\n  \n  var input = ' + (this.dataFormatter !== null && typeof this.formatDataIn === 'function' ? 'formatDataIn(rawInput)' : 'rawInput') + ';\n  var json = ' + jsonString + ';\n  var output = [];\n  var states = [];\n  var prevStates;\n  var state;\n  for (let _i = 0; _i < input.length; _i++) {\n    prevStates = states;\n    states = [];\n    ' + statesRaw.join(';\n    ') + ';\n    for (var stateIndex = 0, stateMax = ' + statesRaw.length + '; stateIndex < stateMax; stateIndex++) {\n      state = states[stateIndex];\n      var product = state.product;\n      var left = state.left;\n      var right = state.right;\n      \n      switch (state.name) {\n' + innerFunctionsSwitch.join('\n') + '\n      }\n    }\n  }\n  ' + (this.dataFormatter !== null && typeof this.formatDataOut === 'function' ? 'return formatDataOut(input, ' + (this.outputSize === 1 ? 'state.product.weights[0]' : 'state.product.weights') + ')' : 'return ' + (this.outputSize === 1 ? 'state.product.weights[0]' : 'state.product.weights')) + ';\n  function Matrix(rows, columns) {\n    this.rows = rows;\n    this.columns = columns;\n    this.weights = zeros(rows * columns);\n  }\n  ' + (this.dataFormatter !== null && typeof this.formatDataIn === 'function' ? 'function formatDataIn(input, output) { ' + toInner(this.formatDataIn.toString()).replace(/this[.]dataFormatter[\n\s]+[.]/g, '').replace(/this[.]dataFormatter[.]/g, '').replace(/this[.]dataFormatter/g, 'true') + ' }' : '') + '\n  ' + (this.dataFormatter !== null && typeof this.formatDataOut === 'function' ? 'function formatDataOut(input, output) { ' + toInner(this.formatDataOut.toString()).replace(/this[.]dataFormatter[\n\s]+[.]/g, '').replace(/this[.]dataFormatter[.]/g, '').replace(/this[.]dataFormatter/g, 'true') + ' }' : '') + '\n  ' + _zeros2.default.toString() + '\n  ' + _softmax2.default.toString().replace('_2.default', 'Matrix') + '\n  ' + _random.randomF.toString() + '\n  ' + _sampleI2.default.toString() + '\n  ' + _maxI2.default.toString();
      return new Function('rawInput', src);
    }
  }]);

  return RNNTimeStep;
}(_rnn2.default);

exports.default = RNNTimeStep;


RNNTimeStep.defaults = {
  inputSize: 1,
  hiddenLayers: [20],
  outputSize: 1,
  learningRate: 0.01,
  decayRate: 0.999,
  smoothEps: 1e-8,
  regc: 0.000001,
  clipval: 5,
  dataFormatter: null
};

RNNTimeStep.trainDefaults = _rnn2.default.trainDefaults;
//# sourceMappingURL=rnn-time-step.js.map