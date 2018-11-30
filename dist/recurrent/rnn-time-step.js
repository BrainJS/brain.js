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

var _lookupTable2 = require('../utilities/lookup-table');

var _lookupTable3 = _interopRequireDefault(_lookupTable2);

var _arrayLookupTable = require('../utilities/array-lookup-table');

var _arrayLookupTable2 = _interopRequireDefault(_arrayLookupTable);

var _cast = require('../utilities/cast');

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
        if (this.outputLookup) {
          this.forecast = this.runObject;
          return this.runObject(input);
        }
        this.forecast = this.forecastNumbers;
        return this.forecastNumbers(input, count);
      }
      if (this.outputLookup) {
        this.forecast = this.forecastObjects;
        return this.forecastObjects(input, count);
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

      this.trainOpts = options = Object.assign({}, this.constructor.trainDefaults, options);
      var iterations = options.iterations;
      var errorThresh = options.errorThresh;
      var log = options.log === true ? console.log : options.log;
      var logPeriod = options.logPeriod;
      var callback = options.callback;
      var callbackPeriod = options.callbackPeriod;

      if (this.inputSize === 1 || !this.inputSize) {
        this.setSize(data);
      }

      data = this.formatData(data);
      var error = Infinity;
      var i = void 0;

      this.verifyIsInitialized(data);

      for (i = 0; i < iterations && error > errorThresh; i++) {
        var sum = 0;
        for (var j = 0; j < data.length; j++) {
          var err = this.trainPattern(data[j], true);
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

    /**
     *
     * @param data
     * Verifies network sizes are initialized
     * If they are not it will initialize them based off the data set.
     */

  }, {
    key: 'verifyIsInitialized',
    value: function verifyIsInitialized(data) {
      if (data[0].input) {
        this.trainInput = this.trainInputOutput;
      } else if (data[0].length > 0) {
        if (data[0][0].length > 0) {
          this.trainInput = this.trainArrays;
        } else {
          if (this.inputSize > 1) {
            this.trainInput = this.trainArrays;
          } else {
            this.trainInput = this.trainNumbers;
          }
        }
      }

      if (!this.model) {
        this.initialize();
      }
    }
  }, {
    key: 'setSize',
    value: function setSize(data) {
      var dataShape = _lookup2.default.dataShape(data).join(',');
      switch (dataShape) {
        case 'array,array,number':
        case 'array,object,number':
        case 'array,datum,array,number':
        case 'array,datum,object,number':
          // probably 1
          break;
        case 'array,array,array,number':
          this.inputSize = this.outputSize = data[0][0].length;
          break;
        case 'array,array,object,number':
          this.inputSize = this.outputSize = Object.keys(_lookup2.default.toTable2D(data)).length;
          break;
        case 'array,datum,array,array,number':
          this.inputSize = this.outputSize = data[0].input[0].length;
          break;
        case 'array,datum,array,object,number':
          this.inputSize = Object.keys(_lookup2.default.toInputTable2D(data)).length;
          this.outputSize = Object.keys(_lookup2.default.toOutputTable2D(data)).length;
          break;
        default:
          throw new Error('unknown data shape or configuration');
      }
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
    key: 'forecastObjects',
    value: function forecastObjects(input, count) {
      var _this2 = this;

      input = input.map(function (value) {
        return _lookup2.default.toArray(_this2.outputLookup, value, _this2.outputLookupLength);
      });
      return this.forecastArrays(input, count).map(function (value) {
        return _lookup2.default.toObject(_this2.outputLookup, value);
      });
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
      var dataShape = _lookup2.default.dataShape(data).join(',');
      var result = [];
      switch (dataShape) {
        case 'array,number':
          {
            if (this.inputSize !== 1) {
              throw new Error('inputSize must be 1 for this data size');
            }
            if (this.outputSize !== 1) {
              throw new Error('outputSize must be 1 for this data size');
            }
            for (var i = 0; i < data.length; i++) {
              result.push(Float32Array.from([data[i]]));
            }
            return [result];
          }
        case 'array,array,number':
          {
            if (this.inputSize === 1 && this.outputSize === 1) {
              for (var _i3 = 0; _i3 < data.length; _i3++) {
                result.push((0, _cast.arrayToFloat32Arrays)(data[_i3]));
              }
              return result;
            }
            if (this.inputSize !== data[0].length) {
              throw new Error('inputSize must match data input size');
            }
            if (this.outputSize !== data[0].length) {
              throw new Error('outputSize must match data input size');
            }
            for (var _i4 = 0; _i4 < data.length; _i4++) {
              result.push(Float32Array.from(data[_i4]));
            }
            return [result];
          }
        case 'array,object,number':
          {
            if (this.inputSize !== 1) {
              throw new Error('inputSize must be 1 for this data size');
            }
            if (this.outputSize !== 1) {
              throw new Error('outputSize must be 1 for this data size');
            }
            if (!this.inputLookup) {
              var lookupTable = new _lookupTable3.default(data);
              this.inputLookup = this.outputLookup = lookupTable.table;
              this.inputLookupLength = this.outputLookupLength = lookupTable.length;
            }
            for (var _i5 = 0; _i5 < data.length; _i5++) {
              result.push((0, _cast.objectToFloat32Arrays)(data[_i5]));
            }
            return result;
          }
        case 'array,datum,array,number':
          {
            if (this.inputSize !== 1) {
              throw new Error('inputSize must be 1 for this data size');
            }
            if (this.outputSize !== 1) {
              throw new Error('outputSize must be 1 for this data size');
            }
            for (var _i6 = 0; _i6 < data.length; _i6++) {
              var datum = data[_i6];
              result.push({
                input: (0, _cast.arrayToFloat32Arrays)(datum.input),
                output: (0, _cast.arrayToFloat32Arrays)(datum.output)
              });
            }
            return result;
          }
        case 'array,datum,object,number':
          {
            if (this.inputSize !== 1) {
              throw new Error('inputSize must be 1 for this data size');
            }
            if (this.outputSize !== 1) {
              throw new Error('outputSize must be 1 for this data size');
            }
            if (!this.inputLookup) {
              var inputLookup = new _lookupTable3.default(data, 'input');
              this.inputLookup = inputLookup.table;
              this.inputLookupLength = inputLookup.length;
            }
            if (!this.outputLookup) {
              var outputLookup = new _lookupTable3.default(data, 'output');
              this.outputLookup = outputLookup.table;
              this.outputLookupLength = outputLookup.length;
            }
            for (var _i7 = 0; _i7 < data.length; _i7++) {
              var _datum = data[_i7];
              result.push({
                input: (0, _cast.objectToFloat32Arrays)(_datum.input),
                output: (0, _cast.objectToFloat32Arrays)(_datum.output)
              });
            }
            return result;
          }
        case 'array,array,array,number':
          {
            for (var _i8 = 0; _i8 < data.length; _i8++) {
              result.push((0, _cast.arraysToFloat32Arrays)(data[_i8]));
            }
            return result;
          }
        case 'array,array,object,number':
          {
            if (!this.inputLookup) {
              var _lookupTable = new _lookupTable3.default(data);
              this.inputLookup = this.outputLookup = _lookupTable.table;
              this.inputLookupLength = this.outputLookupLength = _lookupTable.length;
            }
            for (var _i9 = 0; _i9 < data.length; _i9++) {
              var array = [];
              for (var j = 0; j < data[_i9].length; j++) {
                array.push((0, _cast.objectToFloat32Array)(data[_i9][j], this.inputLookup, this.inputLookupLength));
              }
              result.push(array);
            }
            return result;
          }
        case 'array,datum,array,array,number':
          {
            if (this.inputSize === 1 && this.outputSize === 1) {
              for (var _i10 = 0; _i10 < data.length; _i10++) {
                var _datum2 = data[_i10];
                result.push({
                  input: Float32Array.from(_datum2.input),
                  output: Float32Array.from(_datum2.output)
                });
              }
            } else {
              if (this.inputSize !== data[0].input[0].length) {
                throw new Error('inputSize must match data input size');
              }
              if (this.outputSize !== data[0].output[0].length) {
                throw new Error('outputSize must match data output size');
              }
              for (var _i11 = 0; _i11 < data.length; _i11++) {
                var _datum3 = data[_i11];
                result.push({
                  input: (0, _cast.arraysToFloat32Arrays)(_datum3.input),
                  output: (0, _cast.arraysToFloat32Arrays)(_datum3.output)
                });
              }
            }
            return result;
          }
        case 'array,datum,array,object,number':
          {
            if (!this.inputLookup) {
              var _inputLookup = new _arrayLookupTable2.default(data, 'input');
              this.inputLookup = _inputLookup.table;
              this.inputLookupLength = _inputLookup.length;
            }
            if (!this.outputLookup) {
              var _outputLookup = new _arrayLookupTable2.default(data, 'output');
              this.outputLookup = _outputLookup.table;
              this.outputLookupLength = _outputLookup.length;
            }
            for (var _i12 = 0; _i12 < data.length; _i12++) {
              var _datum4 = data[_i12];
              result.push({
                input: (0, _cast.objectsToFloat32Arrays)(_datum4.input, this.inputLookup, this.inputLookupLength),
                output: (0, _cast.objectsToFloat32Arrays)(_datum4.output, this.outputLookup, this.outputLookupLength)
              });
            }
            return result;
          }
        default:
          throw new Error('unknown data shape or configuration');
      }
    }

    /**
     *
     * @param data
     * @returns {
     *  {
     *    error: number,
     *    misclasses: Array
     *  }
     * }
     */

  }, {
    key: 'test',
    value: function test(data) {
      var formattedData = this.formatData(data);
      // for classification problems
      var misclasses = [];
      // run each pattern through the trained network and collect
      // error and misclassification statistics
      var errorSum = 0;
      var dataShape = _lookup2.default.dataShape(data).join(',');
      switch (dataShape) {
        case 'array,array,number':
          {
            if (this.inputSize === 1) {
              for (var i = 0; i < formattedData.length; i++) {
                var input = formattedData[i];
                var output = this.run(input.splice(0, input.length - 1));
                var target = input[input.length - 1][0];
                var error = target - output;
                var errorMSE = error * error;
                errorSum += errorMSE;
                var errorsAbs = Math.abs(errorMSE);
                if (errorsAbs > this.trainOpts.errorThresh) {
                  var misclass = data[i];
                  Object.assign(misclass, {
                    value: input,
                    actual: output
                  });
                  misclasses.push(misclass);
                }
              }
              break;
            }
            throw new Error('unknown data shape or configuration');
          }
        case 'array,array,array,number':
          {
            for (var _i13 = 0; _i13 < formattedData.length; _i13++) {
              var _input = formattedData[_i13];
              var _output = this.run(_input.splice(0, _input.length - 1));
              var _target = _input[_input.length - 1];
              var errors = 0;
              var errorCount = 0;
              for (var j = 0; j < _output.length; j++) {
                errorCount++;
                var _error = _target[j] - _output[j];
                // mse
                errors += _error * _error;
              }
              errorSum += errors / errorCount;
              var _errorsAbs = Math.abs(errors);
              if (_errorsAbs > this.trainOpts.errorThresh) {
                var _misclass = data[_i13];
                misclasses.push({
                  value: _misclass,
                  actual: _output
                });
              }
            }
            break;
          }
        case 'array,object,number':
          {
            for (var _i14 = 0; _i14 < formattedData.length; _i14++) {
              var _input2 = formattedData[_i14];
              var _output2 = this.run(_lookup2.default.toObjectPartial(this.outputLookup, _input2, 0, _input2.length - 1));
              var _target2 = _input2[_input2.length - 1];
              var _errors = 0;
              var p = void 0;
              for (p in _output2) {}
              var _error2 = _target2[_i14] - _output2[p];
              // mse
              _errors += _error2 * _error2;
              errorSum += _errors;
              var _errorsAbs2 = Math.abs(_errors);
              if (_errorsAbs2 > this.trainOpts.errorThresh) {
                var _misclass2 = data[_i14];
                misclasses.push({
                  value: _misclass2,
                  actual: _output2
                });
              }
            }
            break;
          }
        case 'array,array,object,number':
          {
            for (var _i15 = 0; _i15 < formattedData.length; _i15++) {
              var _input3 = formattedData[_i15];
              var _output3 = this.run(_input3.slice(0, _input3.length - 1));
              var _target3 = data[_i15][_input3.length - 1];
              var _errors2 = 0;
              var _errorCount = 0;
              for (var _p in _output3) {
                var _error3 = _target3[_p] - _output3[_p];
                // mse
                _errors2 += _error3 * _error3;
                _errorCount++;
              }
              errorSum += _errors2 / _errorCount;
              var _errorsAbs3 = Math.abs(_errors2);
              if (_errorsAbs3 > this.trainOpts.errorThresh) {
                var _misclass3 = data[_i15];
                misclasses.push({
                  value: _misclass3,
                  actual: _output3
                });
              }
            }
            break;
          }
        case 'array,datum,array,number':
        case 'array,datum,object,number':
          {
            for (var _i16 = 0; _i16 < formattedData.length; _i16++) {
              var datum = formattedData[_i16];
              var _output4 = this.forecast(datum.input, datum.output.length);
              var _errors3 = 0;
              var _errorCount2 = 0;
              for (var _j = 0; _j < _output4.length; _j++) {
                var _error4 = datum.output[_j][0] - _output4[_j];
                _errors3 += _error4 * _error4;
                _errorCount2++;
              }

              errorSum += _errors3 / _errorCount2;
              var _errorsAbs4 = Math.abs(_errors3);
              if (_errorsAbs4 > this.trainOpts.errorThresh) {
                var _misclass4 = data[_i16];
                Object.assign(_misclass4, {
                  actual: this.outputLookup ? _lookup2.default.toObject(this.outputLookup, _output4) : _output4
                });
                misclasses.push(_misclass4);
              }
            }
            break;
          }
        case 'array,datum,array,array,number':
          {
            for (var _i17 = 0; _i17 < formattedData.length; _i17++) {
              var _datum5 = formattedData[_i17];
              var _output5 = this.forecast(_datum5.input, _datum5.output.length);
              var _errors4 = 0;
              for (var _j2 = 0; _j2 < _output5.length; _j2++) {
                for (var k = 0; k < _output5[_j2].length; k++) {
                  var _error5 = _datum5.output[_j2][k] - _output5[_j2][k];
                  _errors4 += _error5 * _error5;
                }
              }

              errorSum += _errors4;
              var _errorsAbs5 = Math.abs(_errors4);
              if (_errorsAbs5 > this.trainOpts.errorThresh) {
                var _misclass5 = data[_i17];
                misclasses.push({
                  input: _misclass5.input,
                  output: _misclass5.output,
                  actual: _output5
                });
              }
            }
            break;
          }
        case 'array,datum,array,object,number':
          {
            for (var _i18 = 0; _i18 < formattedData.length; _i18++) {
              var _datum6 = formattedData[_i18];
              var _output6 = this.forecast(_datum6.input, _datum6.output.length);
              var _errors5 = 0;
              for (var _j3 = 0; _j3 < _output6.length; _j3++) {
                for (var _p2 in _output6[_j3]) {
                  var _error6 = data[_i18].output[_j3][_p2] - _output6[_j3][_p2];
                  _errors5 += _error6 * _error6;
                }
              }

              errorSum += _errors5;
              var _errorsAbs6 = Math.abs(_errors5);
              if (_errorsAbs6 > this.trainOpts.errorThresh) {
                var _misclass6 = data[_i18];
                misclasses.push({
                  input: _misclass6.input,
                  output: _misclass6.output,
                  actual: _output6
                });
              }
            }
            break;
          }
        default:
          throw new Error('unknown data shape or configuration');
      }

      return {
        error: errorSum / formattedData.length,
        misclasses: misclasses,
        total: formattedData.length
      };
    }
  }, {
    key: 'addFormat',
    value: function addFormat(value) {
      var dataShape = _lookup2.default.dataShape(value).join(',');
      switch (dataShape) {
        case 'array,array,number':
        case 'datum,array,array,number':
        case 'array,number':
        case 'datum,array,number':
          return;
        case 'datum,object,number':
          {
            this.inputLookup = _lookup2.default.addKeys(value.input, this.inputLookup);
            if (this.inputLookup) {
              this.inputLookupLength = Object.keys(this.inputLookup).length;
            }
            this.outputLookup = _lookup2.default.addKeys(value.output, this.outputLookup);
            if (this.outputLookup) {
              this.outputLookupLength = Object.keys(this.outputLookup).length;
            }
            break;
          }
        case 'object,number':
          {
            this.inputLookup = this.outputLookup = _lookup2.default.addKeys(value, this.inputLookup);
            if (this.inputLookup) {
              this.inputLookupLength = this.outputLookupLength = Object.keys(this.inputLookup).length;
            }
            break;
          }
        case 'array,object,number':
          {
            for (var i = 0; i < value.length; i++) {
              this.inputLookup = this.outputLookup = _lookup2.default.addKeys(value[i], this.inputLookup);
              if (this.inputLookup) {
                this.inputLookupLength = this.outputLookupLength = Object.keys(this.inputLookup).length;
              }
            }
            break;
          }
        case 'datum,array,object,number':
          {
            for (var _i19 = 0; _i19 < value.input.length; _i19++) {
              this.inputLookup = _lookup2.default.addKeys(value.input[_i19], this.inputLookup);
              if (this.inputLookup) {
                this.inputLookupLength = Object.keys(this.inputLookup).length;
              }
            }
            for (var _i20 = 0; _i20 < value.output.length; _i20++) {
              this.outputLookup = _lookup2.default.addKeys(value.output[_i20], this.outputLookup);
              if (this.outputLookup) {
                this.outputLookupLength = Object.keys(this.outputLookup).length;
              }
            }
            break;
          }

        default:
          throw new Error('unknown data shape or configuration');
      }
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
          for (var _p3 in hiddenLayer) {
            layers[_p3] = hiddenLayer[_p3].toJSON();
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
  learningRate: _rnn2.default.defaults.learningRate,
  decayRate: _rnn2.default.defaults.decayRate,
  smoothEps: _rnn2.default.defaults.smoothEps,
  regc: _rnn2.default.defaults.regc,
  clipval: _rnn2.default.defaults.clipval
};

RNNTimeStep.trainDefaults = _rnn2.default.trainDefaults;
//# sourceMappingURL=rnn-time-step.js.map