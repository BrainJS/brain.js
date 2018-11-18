import Matrix from './matrix';
import RandomMatrix from './matrix/random-matrix';
import Equation from './matrix/equation';
import RNN from './rnn';
import zeros from '../utilities/zeros';
import softmax from './matrix/softmax';
import {randomF} from '../utilities/random';
import sampleI from './matrix/sample-i';
import maxI from './matrix/max-i';
import lookup from "../lookup";
import LookupTable from '../utilities/lookup-table';
import ArrayLookupTable from '../utilities/array-lookup-table';
import {
  arraysToFloat32Arrays,
  arrayToFloat32Arrays,
  objectsToFloat32Arrays,
  objectToFloat32Arrays,
  objectToFloat32Array } from '../utilities/cast';

export default class RNNTimeStep extends RNN {
  constructor(options) {
    super(options);
    this.inputLookup = null;
    this.inputLookupLength = null;
    this.outputLookup = null;
    this.outputLookupLength = null;
  }

  createOutputMatrix() {
    let model = this.model;
    let outputSize = this.outputSize;
    let lastHiddenSize = this.hiddenLayers[this.hiddenLayers.length - 1];

    //whd
    model.outputConnector = new RandomMatrix(outputSize, lastHiddenSize, 0.08);
    //bd
    model.output = new RandomMatrix(outputSize, 1, 0.08);
  }

  bindEquation() {
    let model = this.model;
    let hiddenLayers = this.hiddenLayers;
    let layers = model.hiddenLayers;
    let equation = new Equation();
    let outputs = [];
    let equationConnection = model.equationConnections.length > 0
      ? model.equationConnections[model.equationConnections.length - 1]
      : this.initialLayerInputs
      ;

      // 0 index
    let output = this.getEquation(equation, equation.input(new Matrix(this.inputSize, 1)), equationConnection[0], layers[0]);
    outputs.push(output);
    // 1+ indices
    for (let i = 1, max = hiddenLayers.length; i < max; i++) {
      output = this.getEquation(equation, output, equationConnection[i], layers[i]);
      outputs.push(output);
    }

    model.equationConnections.push(outputs);
    equation.add(equation.multiply(model.outputConnector, output), model.output);
    model.equations.push(equation);
  }

  mapModel() {
    let model = this.model;
    let hiddenLayers = model.hiddenLayers;
    let allMatrices = model.allMatrices;
    this.initialLayerInputs = this.hiddenLayers.map((size) => new Matrix(size, 1));

    this.createHiddenLayers();
    if (!model.hiddenLayers.length) throw new Error('net.hiddenLayers not set');
    for (let i = 0, max = hiddenLayers.length; i < max; i++) {
      let hiddenMatrix = hiddenLayers[i];
      for (let property in hiddenMatrix) {
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

  backpropagate() {
    for (let i = this.model.equations.length - 1; i > -1; i--) {
      this.model.equations[i].backpropagate();
    }
  }


  /**
   *
   * @param {number[]|number[][]|object|object[][]} [rawInput]
   * @returns {number[]|number|object|object[]|object[][]}
   */
  run(rawInput) {
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

  forecast(input, count) {
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
  train(data, options = {}) {
    options = Object.assign({}, this.constructor.trainDefaults, options);
    const iterations = options.iterations;
    const errorThresh = options.errorThresh;
    const log = options.log === true ? console.log : options.log;
    const logPeriod = options.logPeriod;
    const learningRate = options.learningRate || this.learningRate;
    const callback = options.callback;
    const callbackPeriod = options.callbackPeriod;
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


    let error = Infinity;
    let i;

    if (!this.model) {
      this.initialize();
    }

    for (i = 0; i < iterations && error > errorThresh; i++) {
      let sum = 0;
      for (let j = 0; j < data.length; j++) {
        let err = this.trainPattern(data[j], learningRate);
        sum += err;
      }
      error = sum / data.length;

      if (isNaN(error)) throw new Error('network error rate is unexpected NaN, check network configurations and try again');
      if (log && (i % logPeriod === 0)) {
        log(`iterations: ${ i }, training error: ${ error }`);
      }
      if (callback && (i % callbackPeriod === 0)) {
        callback({ error: error, iterations: i });
      }
    }

    return {
      error: error,
      iterations: i
    };
  }

  trainNumbers(input) {
    const model = this.model;
    const equations = model.equations;
    while (equations.length < input.length) {
      this.bindEquation();
    }
    let errorSum = 0;
    for (let i = 0, max = input.length - 1; i < max; i++) {
      errorSum += equations[i].predictTarget(input[i], input[i + 1]);
    }
    this.end();
    return errorSum / input.length;
  }

  runNumbers(input) {
    if (!this.isRunnable) return null;
    const model = this.model;
    const equations = model.equations;
    if (this.inputLookup) {
      input = lookup.toArray(this.inputLookup, input, this.inputLookupLength);
    }
    while (equations.length <= input.length) {
      this.bindEquation();
    }
    let lastOutput;
    for (let i = 0; i < input.length; i++) {
      lastOutput = equations[i].runInput([input[i]]);
    }
    this.end();
    return lastOutput.weights[0];
  }

  forecastNumbers(input, count) {
    if (!this.isRunnable) return null;
    const model = this.model;
    const equations = model.equations;
    const length = input.length + count;
    while (equations.length <= length) {
      this.bindEquation();
    }
    let lastOutput;
    let equationIndex = 0;
    for (let i = 0; i < input.length; i++) {
      lastOutput = equations[equationIndex++].runInput([input[i]]);
    }
    const result = [lastOutput.weights[0]];
    for (let i = 0, max = count - 1; i < max; i++) {
      lastOutput = equations[equationIndex++].runInput(lastOutput.weights);
      result.push(lastOutput.weights[0]);
    }
    this.end();
    return result;
  }

  runObject(input) {
    if (this.inputLookup === this.outputLookup) {
      const inputArray = lookup.toArrayShort(this.inputLookup, input);
      return lookup.toObjectPartial(this.outputLookup, this.forecastNumbers(inputArray, this.outputLookupLength - inputArray.length), inputArray.length);
    }
    return lookup.toObject(this.outputLookup, this.forecastNumbers(lookup.toArray(this.inputLookup, input, this.inputLookupLength), this.outputLookupLength));
  }

  trainInputOutput(object) {
    const model = this.model;
    const input = object.input;
    const output = object.output;
    const totalSize = input.length + output.length;
    const equations = model.equations;
    while (equations.length < totalSize) {
      this.bindEquation();
    }
    let errorSum = 0;
    let equationIndex = 0;
    for (let inputIndex = 0, max = input.length - 1; inputIndex < max; inputIndex++) {
      errorSum += equations[equationIndex++].predictTarget(input[inputIndex], input[inputIndex + 1]);
    }
    errorSum += equations[equationIndex++].predictTarget(input[input.length - 1], output[0]);
    for (let outputIndex = 0, max = output.length - 1; outputIndex < max; outputIndex++) {
      errorSum += equations[equationIndex++].predictTarget(output[outputIndex], output[outputIndex + 1]);
    }
    this.end();
    return errorSum / totalSize;
  }

  trainArrays(input) {
    const model = this.model;
    const equations = model.equations;
    while (equations.length < input.length) {
      this.bindEquation();
    }
    let errorSum = 0;
    for (let i = 0, max = input.length - 1; i < max; i++) {
      errorSum += equations[i].predictTarget(input[i], input[i + 1]);
    }
    this.end();
    return errorSum / input.length;
  }

  runArrays(input) {
    if (!this.isRunnable) return null;
    const model = this.model;
    const equations = model.equations;
    while (equations.length <= input.length) {
      this.bindEquation();
    }
    if (this.inputLookup) {
      input = lookup.toArrays(this.inputLookup, input, this.inputLookupLength);
    }
    let lastOutput;
    for (let i = 0; i < input.length; i++) {
      let outputMatrix = equations[i].runInput(input[i]);
      lastOutput = outputMatrix.weights;
    }
    this.end();
    if (this.outputLookup) {
      return lookup.toObject(this.outputLookup, lastOutput);
    }
    return lastOutput;
  }

  forecastArrays(input, count) {
    if (!this.isRunnable) return null;
    const model = this.model;
    const equations = model.equations;
    const length = input.length + count;
    while (equations.length <= length) {
      this.bindEquation();
    }
    let lastOutput;
    let equationIndex = 0;
    for (let i = 0; i < input.length; i++) {
      lastOutput = equations[equationIndex++].runInput(input[i]);
    }
    const result = [lastOutput.weights];
    for (let i = 0, max = count - 1; i < max; i++) {
      lastOutput = equations[equationIndex++].runInput(lastOutput.weights);
      result.push(lastOutput.weights.slice(0));
    }
    this.end();
    return result;
  }

  end() {
    this.model.equations[this.model.equations.length - 1].runInput(new Float32Array(this.outputSize));
  }

  /**
   *
   * @param data
   * @returns {*}
   */
  formatData(data) {
    if (data[0].input) {
      if (Array.isArray(data[0].input[0])) {
        if (this.inputSize > 1) {
          // [{ input: number[][], output: number[][] }] to [{ input: Float32Array[], output: Float32Array[] }]
          const result = [];
          for (let i = 0; i < data.length; i++) {
            const datum = data[i];
            result.push({
              input: arraysToFloat32Arrays(datum.input),
              output: arraysToFloat32Arrays(datum.output)
            });
          }
          return result;
        } else {
          // { input: [[1,4],[2,3]], output: [[3,2],[4,1]] } -> [[1,4],[2,3],[3,2],[4,1]]
          const result = [];
          for (let i = 0; i < data.length; i++) {
            const datum = data[i];
            result.push({
              input: Float32Array.from(datum.input),
              output: Float32Array.from(datum.output)
            });
          }
          return result;
        }
      } else if (Array.isArray(data[0].input)) {
        if (typeof data[0].input[0] === 'number') {
          // [{ input: number[], output: number[] }] to [{ input: Float32Array, output: Float32Array }]
          if (this.inputSize === 1) {
            const result = [];
            for (let i = 0; i < data.length; i++) {
              const datum = data[i];
              result.push({
                input: arrayToFloat32Arrays(datum.input),
                output: arrayToFloat32Arrays(datum.output)
              });
            }
            return result;
          }
          throw new Error('data is not recurrent');
        } else {
          // [{ input: object[], output: object[] }] to [{ input: Float32Array[], output: Float32Array[] }]
          const inputLookup = new ArrayLookupTable(data, 'input');
          const outputLookup = new ArrayLookupTable(data, 'output');
          const result = [];

          for (let i = 0; i < data.length; i++) {
            const datum = data[i];
            result.push({
              input: objectsToFloat32Arrays(datum.input, inputLookup),
              output: objectsToFloat32Arrays(datum.output, outputLookup)
            });
          }

          this.inputLookup = inputLookup.table;
          this.inputLookupLength = inputLookup.length;
          this.outputLookup = outputLookup.table;
          this.outputLookupLength = outputLookup.length;
          return result;
        }
      } else if (this.inputSize === 1) {
        // [{ input: object, output: object }] to [{ input: Float32Array, output: Float32Array }]
        const inputLookup = new LookupTable(data, 'input');
        const outputLookup = new LookupTable(data, 'output');
        const result = [];
        for (let i = 0; i < data.length; i++) {
          const datum = data[i];
          result.push({
            input: objectToFloat32Arrays(datum.input),
            output: objectToFloat32Arrays(datum.output)
          });
          this.inputLookup = inputLookup.table;
          this.inputLookupLength = inputLookup.length;
          this.outputLookup = outputLookup.table;
          this.outputLookupLength = outputLookup.length;
        }
        return result;
      }
    } else if (Array.isArray(data)) {
      if (Array.isArray(data[0])) {
        if (this.inputSize > 1) {
          // number[][][] to Float32Array[][][]
          if (Array.isArray(data[0][0])) {
            const result = [];
            for (let i = 0; i < data.length; i++) {
              result.push(arraysToFloat32Arrays(data[i]));
            }
            return result;
          } else {
            // number[][] to Float32Array[][]
            const result = [];
            for (let i = 0; i < data.length; i++) {
              result.push(Float32Array.from(data[i]));
            }
            return result;
          }
        } else if (this.inputSize === 1) {
          // number[][] to Float32Array[][][]
          const result = [];
          for (let i = 0; i < data.length; i++) {
            result.push(arrayToFloat32Arrays(data[i]));
          }
          return result;
        }
      } else if (this.inputSize === 1) {

        if (Array.isArray(data) && typeof data[0] === 'number') {
          // number[] to Float32Array[]
          const result = [];
          for (let i = 0; i < data.length; i++) {
            result.push(Float32Array.from([data[i]]));
          }
          return result;
        } else if (!data[0].hasOwnProperty(0)) {
          // object[] to Float32Array[]
          const result = [];
          const lookupTable = new LookupTable(data);
          for (let i = 0; i < data.length; i++) {
            result.push(objectToFloat32Arrays(data[i]));
          }
          this.inputLookup = lookupTable.table;
          this.inputLookupLength = lookupTable.length;
          this.outputLookup = lookupTable.table;
          this.outputLookupLength = lookupTable.length;
          return result;
        }

      }
    }
    throw new Error('unknown data shape or configuration');
  }

  /**
   *
   * @returns {Object}
   */
  toJSON() {
    const defaults = this.constructor.defaults;
    if (!this.model) {
      this.initialize();
    }
    let model = this.model;
    let options = {};
    for (let p in defaults) {
      if (defaults.hasOwnProperty(p)) {
        options[p] = this[p];
      }
    }

    return {
      type: this.constructor.name,
      options: options,
      hiddenLayers: model.hiddenLayers.map((hiddenLayer) => {
        let layers = {};
        for (let p in hiddenLayer) {
          layers[p] = hiddenLayer[p].toJSON();
        }
        return layers;
      }),
      outputConnector: this.model.outputConnector.toJSON(),
      output: this.model.output.toJSON()
    };
  }

  fromJSON(json) {
    const defaults = this.constructor.defaults;
    const options = json.options;
    this.model = null;
    this.hiddenLayers = null;
    const allMatrices = [];
    const hiddenLayers = [];

    // backward compatibility for hiddenSizes
    (json.hiddenLayers || json.hiddenSizes).forEach((hiddenLayer) => {
      let layers = {};
      for (let p in hiddenLayer) {
        layers[p] = Matrix.fromJSON(hiddenLayer[p]);
        allMatrices.push(layers[p]);
      }
      hiddenLayers.push(layers);
    });

    const outputConnector = Matrix.fromJSON(json.outputConnector);
    allMatrices.push(outputConnector);
    const output = Matrix.fromJSON(json.output);
    allMatrices.push(output);

    Object.assign(this, defaults, options);

    // backward compatibility
    if (options.hiddenSizes) {
      this.hiddenLayers = options.hiddenSizes;
    }

    this.model = {
      hiddenLayers,
      output,
      allMatrices,
      outputConnector,
      equations: [],
      equationConnections: [],
    };
    this.initialLayerInputs = this.hiddenLayers.map((size) => new Matrix(size, 1));
    this.bindEquation();
  }

  /**
   *
   * @returns {Function}
   */
  toFunction() {
    const model = this.model;
    const equations = this.model.equations;
    const inputSize = this.inputSize;
    const inputLookup = this.inputLookup;
    const inputLookupLength = this.inputLookupLength;
    const outputLookup = this.outputLookup;
    const outputLookupLength = this.outputLookupLength;
    const equation = equations[1];
    const states = equation.states;
    const jsonString = JSON.stringify(this.toJSON());

    function matrixOrigin(m, stateIndex) {
      for (let i = 0, max = states.length; i < max; i++) {
        let state = states[i];

        if (i === stateIndex) {
          let j = previousConnectionIndex(m);
          switch (m) {
            case state.left:
              if (j > -1) {
                return `typeof prevStates[${ j }] === 'object' ? prevStates[${ j }].product : new Matrix(${ m.rows }, ${ m.columns })`;
              }
            case state.right:
              if (j > -1) {
                return `typeof prevStates[${ j }] === 'object' ? prevStates[${ j }].product : new Matrix(${ m.rows }, ${ m.columns })`;
              }
            case state.product:
              return `new Matrix(${ m.rows }, ${ m.columns })`;
            default:
              throw Error('unknown state');
          }
        }

        if (m === state.product) return `states[${ i }].product`;
        if (m === state.right) return `states[${ i }].right`;
        if (m === state.left) return `states[${ i }].left`;
      }
    }

    function previousConnectionIndex(m) {
      const connection = model.equationConnections[0];
      const states = equations[0].states;
      for (let i = 0, max = states.length; i < max; i++) {
        if (states[i].product === m) {
          return i;
        }
      }
      return connection.indexOf(m);
    }

    function matrixToString(m, stateIndex) {
      if (!m || !m.rows || !m.columns) return 'null';
      if (m === model.outputConnector) return `json.outputConnector`;
      if (m === model.output) return `json.output`;

      for (let i = 0, max = model.hiddenLayers.length; i < max; i++) {
        let hiddenLayer = model.hiddenLayers[i];
        for (let p in hiddenLayer) {
          if (!hiddenLayer.hasOwnProperty(p)) continue;
          if (hiddenLayer[p] !== m) continue;
          return `json.hiddenLayers[${ i }].${ p }`;
        }
      }

      return matrixOrigin(m, stateIndex);
    }

    function formatInputData() {
      if (!inputLookup) return '';
      if (inputSize === 1) {
        if (inputLookup === outputLookup) {
          return `function lookupInput(input) {
            var table = ${ JSON.stringify(inputLookup) };
            var result = [];
            for (var p in table) {
              if (!input.hasOwnProperty(p)) break;
              result.push(Float32Array.from([input[p]]));
            }
            return result;
          }`;
        }
        return `function lookupInput(input) {
          var table = ${ JSON.stringify(inputLookup) };
          var result = [];
          for (var p in table) {
            result.push(Float32Array.from([input[p]]));
          }
          return result;
        }`;
      }
      return `function lookupInput(rawInputs) {
        var table = ${ JSON.stringify(inputLookup) };
        var result = [];
        for (var i = 0; i < rawInputs.length; i++) {
          var rawInput = rawInputs[i];
          var input = new Float32Array(${ inputLookupLength });
          for (var p in table) {
            input[table[p]] = rawInput.hasOwnProperty(p) ? rawInput[p] : 0;
          }
          result.push(input);
        }
        return result;
      }`;
    }

    function formatOutputData() {
      if (!outputLookup) return '';
      if (inputSize === 1) {
        if (inputLookup === outputLookup) {
          return `function lookupOutputPartial(output, input) {
            var table = ${ JSON.stringify(outputLookup) };
            var offset = input.length;
            var result = {};
            var i = 0;
            for (var p in table) {
              if (i++ < offset) continue;
              result[p] = output[table[p] - offset][0];
            }
            return result;
          }`;
        }
        return `function lookupOutput(output) {
          var table = ${ JSON.stringify(outputLookup) };
          var result = {};
          for (var p in table) {
            result[p] = output[table[p]][0];
          }
          return result;
        }`;
      }
      return `function lookupOutput(output) {
        var table = ${ JSON.stringify(outputLookup) };
        var result = {};
        for (var p in table) {
          result[p] = output[table[p]];
        }
        return result;
      }`;
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

      return fnString.join('}').split('\n').join('\n        ')
        .replace(
          'product.weights = _input.weights = _this.inputValue;',
          inputLookup && inputSize === 1
            ? 'product.weights = _i < input.length ? input[_i]: prevStates[prevStates.length - 1].product.weights;'
            : inputSize === 1
              ? 'product.weights = [input[_i]];'
              : 'product.weights = input[_i];')
        .replace('product.deltas[i] = 0;', '')
        .replace('product.deltas[column] = 0;', '')
        .replace('left.deltas[leftIndex] = 0;', '')
        .replace('right.deltas[rightIndex] = 0;', '')
        .replace('product.deltas = left.deltas.slice(0);', '');
    }

    function fileName(fnName) {
      return `src/recurrent/matrix/${ fnName.replace(/[A-Z]/g, function(value) { return '-' + value.toLowerCase(); }) }.js`;
    }

    let statesRaw = [];
    let usedFunctionNames = {};
    let innerFunctionsSwitch = [];
    for (let i = 0, max = states.length; i < max; i++) {
      let state = states[i];
      statesRaw.push(`states[${ i }] = {
      name: '${ state.forwardFn.name }',
      left: ${ matrixToString(state.left, i) },
      right: ${ matrixToString(state.right, i) },
      product: ${ matrixToString(state.product, i) }
    }`);

      let fnName = state.forwardFn.name;
      if (!usedFunctionNames[fnName]) {
        usedFunctionNames[fnName] = true;
        innerFunctionsSwitch.push(
          `        case '${ fnName }':${ fnName !== 'forwardFn' ? ` //compiled from ${ fileName(fnName) }` : '' }
          ${ toInner(state.forwardFn.toString()) }
          break;`
        );
      }
    }

    const forceForecast = this.inputSize === 1 && this.outputLookup;
    const src = `
  var input = ${ this.inputLookup ? 'lookupInput(rawInput)' : 'rawInput' };
  var json = ${ jsonString };
  var output = [];
  var states = [];
  var prevStates;
  var state;
  var max = ${
      forceForecast
        ? inputLookup === outputLookup
          ? inputLookupLength
          : `input.length + ${ outputLookupLength - 1 }`
        : 'input.length' };
  for (var _i = 0; _i < max; _i++) {
    prevStates = states;
    states = [];
    ${ statesRaw.join(';\n    ') };
    for (var stateIndex = 0, stateMax = ${ statesRaw.length }; stateIndex < stateMax; stateIndex++) {
      state = states[stateIndex];
      var product = state.product;
      var left = state.left;
      var right = state.right;
      
      switch (state.name) {
${ innerFunctionsSwitch.join('\n') }
      }
    }
    ${ inputSize === 1 && inputLookup ? 'if (_i >= input.length - 1) { output.push(state.product.weights); }' : 'output = state.product.weights;' }
  }
  ${
    outputLookup
      ? outputLookup === inputLookup
        ? 'return lookupOutputPartial(output, input)'
        : 'return lookupOutput(output)'
      : inputSize === 1
        ? 'return output[0]'
        : 'return output'
  };
  ${ formatInputData() }
  ${ formatOutputData() }
  
  function Matrix(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.weights = zeros(rows * columns);
  }
  ${ zeros.toString() }
  ${ softmax.toString().replace('_2.default', 'Matrix') }
  ${ randomF.toString() }
  ${ sampleI.toString() }
  ${ maxI.toString() }`;
    return new Function('rawInput', src);
  }
}

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

RNNTimeStep.trainDefaults = RNN.trainDefaults;