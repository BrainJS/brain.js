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

var _lookup = require('../lookup');

var _lookup2 = _interopRequireDefault(_lookup);

var _lookupTable = require('../utilities/lookup-table');

var _lookupTable2 = _interopRequireDefault(_lookupTable);

var _arrayLookupTable = require('../utilities/array-lookup-table');

var _arrayLookupTable2 = _interopRequireDefault(_arrayLookupTable);

var _cast = require('../utilities/cast');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RNNTimeStep = function (_RNN) {
  _inherits(RNNTimeStep, _RNN);

  function RNNTimeStep(options) {
    _classCallCheck(this, RNNTimeStep);

    var _this = _possibleConstructorReturn(this, (RNNTimeStep.__proto__ || Object.getPrototypeOf(RNNTimeStep)).call(this, options));

    _this.inputLookup = null;
    _this.inputLookupLength = null;
    _this.outputLookup = null;
    _this.outputLookupLength = null;
    return _this;
  }

  _createClass(RNNTimeStep, [{
    key: 'createOutputMatrix',
    value: function createOutputMatrix() {
      var model = this.model;
      var outputSize = this.outputSize;
      var lastHiddenSize = this.hiddenLayers[this.hiddenLayers.length - 1];

      //whd
      model.outputConnector = new _randomMatrix2.default(outputSize, lastHiddenSize, 0.08);
      //bd
      model.output = new _randomMatrix2.default(outputSize, 1, 0.08);
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
      var output = this.getEquation(equation, equation.input(new _matrix2.default(this.inputSize, 1)), equationConnection[0], layers[0]);
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
  }, {
    key: 'mapModel',
    value: function mapModel() {
      var model = this.model;
      var hiddenLayers = model.hiddenLayers;
      var allMatrices = model.allMatrices;
      this.initialLayerInputs = this.hiddenLayers.map(function (size) {
        return new _matrix2.default(size, 1);
      });

      this.createHiddenLayers();
      if (!model.hiddenLayers.length) throw new Error('net.hiddenLayers not set');
      for (var i = 0, max = hiddenLayers.length; i < max; i++) {
        var hiddenMatrix = hiddenLayers[i];
        for (var property in hiddenMatrix) {
          if (!hiddenMatrix.hasOwnProperty(property)) continue;
          allMatrices.push(hiddenMatrix[property]);
        }
      }

      this.createOutputMatrix();
      if (!model.outputConnector) throw new Error('net.model.outputConnector not set');
      if (!model.output) throw new Error('net.model.output not set');

      allMatrices.push(model.outputConnector);
      allMatrices.push(model.output);
    }
  }, {
    key: 'backpropagate',
    value: function backpropagate() {
      for (var i = this.model.equations.length - 1; i > -1; i--) {
        this.model.equations[i].backpropagate();
      }
    }

    /**
     *
     * @param {number[]|number[][]|object|object[][]} [rawInput]
     * @returns {number[]|number|object|object[]|object[][]}
     */

  }, {
    key: 'run',
    value: function run(rawInput) {
      if (this.inputSize === 1) {
        if (this.outputLookup) {
          this.run = this.runObject;
          return this.runObject(rawInput);
        }
        this.run = this.runNumbers;
        return this.runNumbers(rawInput);
      }
      this.run = this.runArrays;
      return this.runArrays(rawInput);
    }
  }, {
    key: 'forecast',
    value: function forecast(input, count) {
      if (this.inputSize === 1) {
        this.forecast = this.forecastNumbers;
        return this.forecastNumbers(input, count);
      }
      this.forecast = this.forecastArrays;
      return this.forecastArrays(input, count);
    }

    /**
     *
     * @param {Object[]|String[]} data an array of objects: `{input: 'string', output: 'string'}` or an array of strings
     * @param {Object} [options]
     * @returns {{error: number, iterations: number}}
     */

  }, {
    key: 'train',
    value: function train(data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      options = Object.assign({}, this.constructor.trainDefaults, options);
      var iterations = options.iterations;
      var errorThresh = options.errorThresh;
      var log = options.log === true ? console.log : options.log;
      var logPeriod = options.logPeriod;
      var learningRate = options.learningRate || this.learningRate;
      var callback = options.callback;
      var callbackPeriod = options.callbackPeriod;
      data = this.formatData(data);
      if (data[0].input) {
        this.trainInput = this.trainInputOutput;
      } else if (data[0].length > 0) {
        if (data[0][0].length > 0) {
          this.trainInput = this.trainArrays;
        } else {
          if (this.inputSize > 1) {
            data = [data];
            this.trainInput = this.trainArrays;
          } else {
            this.trainInput = this.trainNumbers;
          }
        }
      }

      var error = Infinity;
      var i = void 0;

      if (!this.model) {
        this.initialize();
      }

      for (i = 0; i < iterations && error > errorThresh; i++) {
        var sum = 0;
        for (var j = 0; j < data.length; j++) {
          var err = this.trainPattern(data[j], learningRate);
          sum += err;
        }
        error = sum / data.length;

        if (isNaN(error)) throw new Error('network error rate is unexpected NaN, check network configurations and try again');
        if (log && i % logPeriod === 0) {
          log('iterations: ' + i + ', training error: ' + error);
        }
        if (callback && i % callbackPeriod === 0) {
          callback({ error: error, iterations: i });
        }
      }

      return {
        error: error,
        iterations: i
      };
    }
  }, {
    key: 'trainNumbers',
    value: function trainNumbers(input) {
      var model = this.model;
      var equations = model.equations;
      while (equations.length < input.length) {
        this.bindEquation();
      }
      var errorSum = 0;
      for (var i = 0, max = input.length - 1; i < max; i++) {
        errorSum += equations[i].predictTarget(input[i], input[i + 1]);
      }
      this.end();
      return errorSum / input.length;
    }
  }, {
    key: 'runNumbers',
    value: function runNumbers(input) {
      if (!this.isRunnable) return null;
      var model = this.model;
      var equations = model.equations;
      if (this.inputLookup) {
        input = _lookup2.default.toArray(this.inputLookup, input, this.inputLookupLength);
      }
      while (equations.length <= input.length) {
        this.bindEquation();
      }
      var lastOutput = void 0;
      for (var i = 0; i < input.length; i++) {
        lastOutput = equations[i].runInput([input[i]]);
      }
      this.end();
      return lastOutput.weights[0];
    }
  }, {
    key: 'forecastNumbers',
    value: function forecastNumbers(input, count) {
      if (!this.isRunnable) return null;
      var model = this.model;
      var equations = model.equations;
      var length = input.length + count;
      while (equations.length <= length) {
        this.bindEquation();
      }
      var lastOutput = void 0;
      var equationIndex = 0;
      for (var i = 0; i < input.length; i++) {
        lastOutput = equations[equationIndex++].runInput([input[i]]);
      }
      var result = [lastOutput.weights[0]];
      for (var _i = 0, max = count - 1; _i < max; _i++) {
        lastOutput = equations[equationIndex++].runInput(lastOutput.weights);
        result.push(lastOutput.weights[0]);
      }
      this.end();
      return result;
    }
  }, {
    key: 'runObject',
    value: function runObject(input) {
      if (this.inputLookup === this.outputLookup) {
        var inputArray = _lookup2.default.toArrayShort(this.inputLookup, input);
        return _lookup2.default.toObjectPartial(this.outputLookup, this.forecastNumbers(inputArray, this.outputLookupLength - inputArray.length), inputArray.length);
      }
      return _lookup2.default.toObject(this.outputLookup, this.forecastNumbers(_lookup2.default.toArray(this.inputLookup, input, this.inputLookupLength), this.outputLookupLength));
    }
  }, {
    key: 'trainInputOutput',
    value: function trainInputOutput(object) {
      var model = this.model;
      var input = object.input;
      var output = object.output;
      var totalSize = input.length + output.length;
      var equations = model.equations;
      while (equations.length < totalSize) {
        this.bindEquation();
      }
      var errorSum = 0;
      var equationIndex = 0;
      for (var inputIndex = 0, max = input.length - 1; inputIndex < max; inputIndex++) {
        errorSum += equations[equationIndex++].predictTarget(input[inputIndex], input[inputIndex + 1]);
      }
      errorSum += equations[equationIndex++].predictTarget(input[input.length - 1], output[0]);
      for (var outputIndex = 0, _max = output.length - 1; outputIndex < _max; outputIndex++) {
        errorSum += equations[equationIndex++].predictTarget(output[outputIndex], output[outputIndex + 1]);
      }
      this.end();
      return errorSum / totalSize;
    }
  }, {
    key: 'trainArrays',
    value: function trainArrays(input) {
      var model = this.model;
      var equations = model.equations;
      while (equations.length < input.length) {
        this.bindEquation();
      }
      var errorSum = 0;
      for (var i = 0, max = input.length - 1; i < max; i++) {
        errorSum += equations[i].predictTarget(input[i], input[i + 1]);
      }
      this.end();
      return errorSum / input.length;
    }
  }, {
    key: 'runArrays',
    value: function runArrays(input) {
      if (!this.isRunnable) return null;
      var model = this.model;
      var equations = model.equations;
      while (equations.length <= input.length) {
        this.bindEquation();
      }
      if (this.inputLookup) {
        input = _lookup2.default.toArrays(this.inputLookup, input, this.inputLookupLength);
      }
      var lastOutput = void 0;
      for (var i = 0; i < input.length; i++) {
        var outputMatrix = equations[i].runInput(input[i]);
        lastOutput = outputMatrix.weights;
      }
      this.end();
      if (this.outputLookup) {
        return _lookup2.default.toObject(this.outputLookup, lastOutput);
      }
      return lastOutput;
    }
  }, {
    key: 'forecastArrays',
    value: function forecastArrays(input, count) {
      if (!this.isRunnable) return null;
      var model = this.model;
      var equations = model.equations;
      var length = input.length + count;
      while (equations.length <= length) {
        this.bindEquation();
      }
      var lastOutput = void 0;
      var equationIndex = 0;
      for (var i = 0; i < input.length; i++) {
        lastOutput = equations[equationIndex++].runInput(input[i]);
      }
      var result = [lastOutput.weights];
      for (var _i2 = 0, max = count - 1; _i2 < max; _i2++) {
        lastOutput = equations[equationIndex++].runInput(lastOutput.weights);
        result.push(lastOutput.weights.slice(0));
      }
      this.end();
      return result;
    }
  }, {
    key: 'end',
    value: function end() {
      this.model.equations[this.model.equations.length - 1].runInput(new Float32Array(this.outputSize));
    }

    /**
     *
     * @param data
     * @returns {*}
     */

  }, {
    key: 'formatData',
    value: function formatData(data) {
      if (data[0].input) {
        if (Array.isArray(data[0].input[0])) {
          if (this.inputSize > 1) {
            // [{ input: number[][], output: number[][] }] to [{ input: Float32Array[], output: Float32Array[] }]
            var result = [];
            for (var i = 0; i < data.length; i++) {
              var datum = data[i];
              result.push({
                input: (0, _cast.arraysToFloat32Arrays)(datum.input),
                output: (0, _cast.arraysToFloat32Arrays)(datum.output)
              });
            }
            return result;
          } else {
            // { input: [[1,4],[2,3]], output: [[3,2],[4,1]] } -> [[1,4],[2,3],[3,2],[4,1]]
            var _result = [];
            for (var _i3 = 0; _i3 < data.length; _i3++) {
              var _datum = data[_i3];
              _result.push({
                input: Float32Array.from(_datum.input),
                output: Float32Array.from(_datum.output)
              });
            }
            return _result;
          }
        } else if (Array.isArray(data[0].input)) {
          if (typeof data[0].input[0] === 'number') {
            // [{ input: number[], output: number[] }] to [{ input: Float32Array, output: Float32Array }]
            if (this.inputSize === 1) {
              var _result2 = [];
              for (var _i4 = 0; _i4 < data.length; _i4++) {
                var _datum2 = data[_i4];
                _result2.push({
                  input: (0, _cast.arrayToFloat32Arrays)(_datum2.input),
                  output: (0, _cast.arrayToFloat32Arrays)(_datum2.output)
                });
              }
              return _result2;
            }
            throw new Error('data is not recurrent');
          } else {
            // [{ input: object[], output: object[] }] to [{ input: Float32Array[], output: Float32Array[] }]
            var inputLookup = new _arrayLookupTable2.default(data, 'input');
            var outputLookup = new _arrayLookupTable2.default(data, 'output');
            var _result3 = [];

            for (var _i5 = 0; _i5 < data.length; _i5++) {
              var _datum3 = data[_i5];
              _result3.push({
                input: (0, _cast.objectsToFloat32Arrays)(_datum3.input, inputLookup),
                output: (0, _cast.objectsToFloat32Arrays)(_datum3.output, outputLookup)
              });
            }

            this.inputLookup = inputLookup.table;
            this.inputLookupLength = inputLookup.length;
            this.outputLookup = outputLookup.table;
            this.outputLookupLength = outputLookup.length;
            return _result3;
          }
        } else if (this.inputSize === 1) {
          // [{ input: object, output: object }] to [{ input: Float32Array, output: Float32Array }]
          var _inputLookup = new _lookupTable2.default(data, 'input');
          var _outputLookup = new _lookupTable2.default(data, 'output');
          var _result4 = [];
          for (var _i6 = 0; _i6 < data.length; _i6++) {
            var _datum4 = data[_i6];
            _result4.push({
              input: (0, _cast.objectToFloat32Arrays)(_datum4.input),
              output: (0, _cast.objectToFloat32Arrays)(_datum4.output)
            });
            this.inputLookup = _inputLookup.table;
            this.inputLookupLength = _inputLookup.length;
            this.outputLookup = _outputLookup.table;
            this.outputLookupLength = _outputLookup.length;
          }
          return _result4;
        }
      } else if (Array.isArray(data)) {
        if (Array.isArray(data[0])) {
          if (this.inputSize > 1) {
            // number[][][] to Float32Array[][][]
            if (Array.isArray(data[0][0])) {
              var _result5 = [];
              for (var _i7 = 0; _i7 < data.length; _i7++) {
                _result5.push((0, _cast.arraysToFloat32Arrays)(data[_i7]));
              }
              return _result5;
            } else {
              // number[][] to Float32Array[][]
              var _result6 = [];
              for (var _i8 = 0; _i8 < data.length; _i8++) {
                _result6.push(Float32Array.from(data[_i8]));
              }
              return _result6;
            }
          } else if (this.inputSize === 1) {
            // number[][] to Float32Array[][][]
            var _result7 = [];
            for (var _i9 = 0; _i9 < data.length; _i9++) {
              _result7.push((0, _cast.arrayToFloat32Arrays)(data[_i9]));
            }
            return _result7;
          }
        } else if (this.inputSize === 1) {

          if (Array.isArray(data) && typeof data[0] === 'number') {
            // number[] to Float32Array[]
            var _result8 = [];
            for (var _i10 = 0; _i10 < data.length; _i10++) {
              _result8.push(Float32Array.from([data[_i10]]));
            }
            return _result8;
          } else if (!data[0].hasOwnProperty(0)) {
            // object[] to Float32Array[]
            var _result9 = [];
            var lookupTable = new _lookupTable2.default(data);
            for (var _i11 = 0; _i11 < data.length; _i11++) {
              _result9.push((0, _cast.objectToFloat32Arrays)(data[_i11]));
            }
            this.inputLookup = lookupTable.table;
            this.inputLookupLength = lookupTable.length;
            this.outputLookup = lookupTable.table;
            this.outputLookupLength = lookupTable.length;
            return _result9;
          }
        }
      }
      throw new Error('unknown data shape or configuration');
    }

    /**
     *
     * @returns {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var defaults = this.constructor.defaults;
      if (!this.model) {
        this.initialize();
      }
      var model = this.model;
      var options = {};
      for (var p in defaults) {
        if (defaults.hasOwnProperty(p)) {
          options[p] = this[p];
        }
      }

      return {
        type: this.constructor.name,
        options: options,
        hiddenLayers: model.hiddenLayers.map(function (hiddenLayer) {
          var layers = {};
          for (var _p in hiddenLayer) {
            layers[_p] = hiddenLayer[_p].toJSON();
          }
          return layers;
        }),
        outputConnector: this.model.outputConnector.toJSON(),
        output: this.model.output.toJSON()
      };
    }
  }, {
    key: 'fromJSON',
    value: function fromJSON(json) {
      var defaults = this.constructor.defaults;
      var options = json.options;
      this.model = null;
      this.hiddenLayers = null;
      var allMatrices = [];
      var hiddenLayers = [];

      // backward compatibility for hiddenSizes
      (json.hiddenLayers || json.hiddenSizes).forEach(function (hiddenLayer) {
        var layers = {};
        for (var p in hiddenLayer) {
          layers[p] = _matrix2.default.fromJSON(hiddenLayer[p]);
          allMatrices.push(layers[p]);
        }
        hiddenLayers.push(layers);
      });

      var outputConnector = _matrix2.default.fromJSON(json.outputConnector);
      allMatrices.push(outputConnector);
      var output = _matrix2.default.fromJSON(json.output);
      allMatrices.push(output);

      Object.assign(this, defaults, options);

      // backward compatibility
      if (options.hiddenSizes) {
        this.hiddenLayers = options.hiddenSizes;
      }

      this.model = {
        hiddenLayers: hiddenLayers,
        output: output,
        allMatrices: allMatrices,
        outputConnector: outputConnector,
        equations: [],
        equationConnections: []
      };
      this.initialLayerInputs = this.hiddenLayers.map(function (size) {
        return new _matrix2.default(size, 1);
      });
      this.bindEquation();
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
      var inputLookup = this.inputLookup;
      var inputLookupLength = this.inputLookupLength;
      var outputLookup = this.outputLookup;
      var outputLookupLength = this.outputLookupLength;
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

      function formatInputData() {
        if (!inputLookup) return '';
        if (inputSize === 1) {
          if (inputLookup === outputLookup) {
            return 'function lookupInput(input) {\n            var table = ' + JSON.stringify(inputLookup) + ';\n            var result = [];\n            for (var p in table) {\n              if (!input.hasOwnProperty(p)) break;\n              result.push(Float32Array.from([input[p]]));\n            }\n            return result;\n          }';
          }
          return 'function lookupInput(input) {\n          var table = ' + JSON.stringify(inputLookup) + ';\n          var result = [];\n          for (var p in table) {\n            result.push(Float32Array.from([input[p]]));\n          }\n          return result;\n        }';
        }
        return 'function lookupInput(rawInputs) {\n        var table = ' + JSON.stringify(inputLookup) + ';\n        var result = [];\n        for (var i = 0; i < rawInputs.length; i++) {\n          var rawInput = rawInputs[i];\n          var input = new Float32Array(' + inputLookupLength + ');\n          for (var p in table) {\n            input[table[p]] = rawInput.hasOwnProperty(p) ? rawInput[p] : 0;\n          }\n          result.push(input);\n        }\n        return result;\n      }';
      }

      function formatOutputData() {
        if (!outputLookup) return '';
        if (inputSize === 1) {
          if (inputLookup === outputLookup) {
            return 'function lookupOutputPartial(output, input) {\n            var table = ' + JSON.stringify(outputLookup) + ';\n            var offset = input.length;\n            var result = {};\n            var i = 0;\n            for (var p in table) {\n              if (i++ < offset) continue;\n              result[p] = output[table[p] - offset][0];\n            }\n            return result;\n          }';
          }
          return 'function lookupOutput(output) {\n          var table = ' + JSON.stringify(outputLookup) + ';\n          var result = {};\n          for (var p in table) {\n            result[p] = output[table[p]][0];\n          }\n          return result;\n        }';
        }
        return 'function lookupOutput(output) {\n        var table = ' + JSON.stringify(outputLookup) + ';\n        var result = {};\n        for (var p in table) {\n          result[p] = output[table[p]];\n        }\n        return result;\n      }';
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

        return fnString.join('}').split('\n').join('\n        ').replace('product.weights = _input.weights = _this.inputValue;', inputLookup && inputSize === 1 ? 'product.weights = _i < input.length ? input[_i]: prevStates[prevStates.length - 1].product.weights;' : inputSize === 1 ? 'product.weights = [input[_i]];' : 'product.weights = input[_i];').replace('product.deltas[i] = 0;', '').replace('product.deltas[column] = 0;', '').replace('left.deltas[leftIndex] = 0;', '').replace('right.deltas[rightIndex] = 0;', '').replace('product.deltas = left.deltas.slice(0);', '');
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

      var forceForecast = this.inputSize === 1 && this.outputLookup;
      var src = '\n  var input = ' + (this.inputLookup ? 'lookupInput(rawInput)' : 'rawInput') + ';\n  var json = ' + jsonString + ';\n  var output = [];\n  var states = [];\n  var prevStates;\n  var state;\n  var max = ' + (forceForecast ? inputLookup === outputLookup ? inputLookupLength : 'input.length + ' + (outputLookupLength - 1) : 'input.length') + ';\n  for (var _i = 0; _i < max; _i++) {\n    prevStates = states;\n    states = [];\n    ' + statesRaw.join(';\n    ') + ';\n    for (var stateIndex = 0, stateMax = ' + statesRaw.length + '; stateIndex < stateMax; stateIndex++) {\n      state = states[stateIndex];\n      var product = state.product;\n      var left = state.left;\n      var right = state.right;\n      \n      switch (state.name) {\n' + innerFunctionsSwitch.join('\n') + '\n      }\n    }\n    ' + (inputSize === 1 && inputLookup ? 'if (_i >= input.length - 1) { output.push(state.product.weights); }' : 'output = state.product.weights;') + '\n  }\n  ' + (outputLookup ? outputLookup === inputLookup ? 'return lookupOutputPartial(output, input)' : 'return lookupOutput(output)' : inputSize === 1 ? 'return output[0]' : 'return output') + ';\n  ' + formatInputData() + '\n  ' + formatOutputData() + '\n  \n  function Matrix(rows, columns) {\n    this.rows = rows;\n    this.columns = columns;\n    this.weights = zeros(rows * columns);\n  }\n  ' + _zeros2.default.toString() + '\n  ' + _softmax2.default.toString().replace('_2.default', 'Matrix') + '\n  ' + _random.randomF.toString() + '\n  ' + _sampleI2.default.toString() + '\n  ' + _maxI2.default.toString();
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
  clipval: 5
};

RNNTimeStep.trainDefaults = _rnn2.default.trainDefaults;
//# sourceMappingURL=rnn-time-step.js.map