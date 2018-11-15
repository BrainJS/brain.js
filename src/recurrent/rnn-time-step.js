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
   * @param {Number[]|Number[][]} [input]
   * @returns {Number[]|Number|Object[]|Object[][]}
   */
  run(input = []) {
    if (this.inputSize === 1) {
      if (this.outputLookup) {
        this.run = this.runObject;
        return this.runObject(input);
      }
      this.run = this.runNumbers;
      return this.runNumbers(input);
    }
    this.run = this.runArrays;
    return this.runArrays(input);
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
    while (equations.length <= input.length) {
      this.bindEquation();
    }
    let lastOutput;
    for (let i = 0; i < input.length; i++) {
      lastOutput = equations[i].runInput([input[i]]);
    }
    this.end();
    return lastOutput.weights.slice(0);
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
    let lastOutput;
    for (let i = 0; i < input.length; i++) {
      let outputMatrix = equations[i].runInput(input[i]);
      lastOutput = outputMatrix.weights;
    }
    this.end();
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
      result.push(lastOutput.weights);
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
            const input = datum.input;
            const output = datum.output;
            const newInput = [];
            const newOutput = [];
            for (let j = 0; j < input.length; j++) {
              newInput.push(Float32Array.from(input[j]));
            }
            for (let j = 0; j < output.length; j++) {
              newOutput.push(Float32Array.from(output[j]));
            }
            result.push({
              input: newInput,
              output: newOutput
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
              const input = datum.input;
              const output = datum.output;
              const newInput = [];
              const newOutput = [];
              for (let j = 0; j < input.length; j++) {
                newInput.push(Float32Array.from([input[j]]));
              }
              for (let j = 0; j < output.length; j++) {
                newOutput.push(Float32Array.from([output[j]]));
              }
              result.push({
                input: newInput,
                output: newOutput
              });
            }
            return result;
          }
          throw new Error(`data size too small for brain.${ this.constructor.name }, try brain.NeuralNetwork`);
        } else {
          // [{ input: object[], output: object[] }] to [{ input: Float32Array[], output: Float32Array[] }]
          const inputLookup = {};
          const outputLookup = {};
          let inputLookupLength = 0;
          let outputLookupLength = 0;
          const result = [];
          for (let i = 0; i < data.length; i++) {
            const datum = data[i];
            const input = datum.input;
            for (let j = 0; j < input.length; j++) {
              for (let p in input[j]) {
                if (inputLookup.hasOwnProperty(p)) continue;
                inputLookup[p] = inputLookupLength++;
              }
            }
            const output = datum.output;
            for (let j = 0; j < output.length; j++) {
              for (let p in output[j]) {
                if (outputLookup.hasOwnProperty(p)) continue;
                outputLookup[p] = outputLookupLength++;
              }
            }
          }

          for (let i = 0; i < data.length; i++) {
            const datum = data[i];
            const input = datum.input;
            const output = datum.output;
            const newInputs = [];
            const newOutputs = [];
            for (let j = 0; j < input.length; j++) {
              const newInput = new Float32Array(inputLookupLength);
              for (let p in input[j]) {
                newInput[inputLookup[p]] = input[j].hasOwnProperty(p) ? input[j][p] : 0;
              }
              newInputs.push(newInput);
            }
            for (let j = 0; j < output.length; j++) {
              const newOutput = new Float32Array(outputLookupLength);
              for (let p in output[j]) {
                newOutput[outputLookup[p]] = output[j].hasOwnProperty(p) ? output[j][p] : 0;
              }
              newOutputs.push(newOutput);
            }
            result.push({ input: newInputs, output: newOutputs });
          }

          this.inputLookup = inputLookup;
          this.inputLookupLength = inputLookupLength;
          this.outputLookup = outputLookup;
          this.outputLookupLength = outputLookupLength;
          return result;
        }
      } else {
        // [{ input: object, output: object }] to [{ input: Float32Array, output: Float32Array }]
        if (this.inputSize === 1) {
          const result = [];
          for (let i = 0; i < data.length; i++) {
            const datum = data[i];
            const input = datum.input;
            const output = datum.output;
            const newInput = [];
            const newOutput = [];
            const inputLookup = {};
            const outputLookup = {};
            let inputLookupLength = 0;
            let outputLookupLength = 0;
            for (let i = 0; i < data.length; i++) {
              const datum = data[i];
              const input = datum.input;
              for (let p in input) {
                if (inputLookup.hasOwnProperty(p)) continue;
                inputLookup[p] = inputLookupLength++;
              }

              const output = datum.output;
              for (let p in output) {
                if (outputLookup.hasOwnProperty(p)) continue;
                outputLookup[p] = outputLookupLength++;
              }
            }
            for (let p in input) {
              newInput.push(Float32Array.from([input[p]]));
            }
            for (let p in output) {
              newOutput.push(Float32Array.from([output[p]]));
            }
            result.push({
              input: newInput,
              output: newOutput
            });
            this.inputLookup = inputLookup;
            this.inputLookupLength = inputLookupLength;
            this.outputLookup = outputLookup;
            this.outputLookupLength = outputLookupLength;
          }
          return result;
        } else {
          const inputLookup = {};
          const outputLookup = {};
          let inputLookupLength = 0;
          let outputLookupLength = 0;
          const result = [];
          for (let i = 0; i < data.length; i++) {
            const datum = data[i];
            const input = datum.input;
            const output = datum.output;
            for (let p in input) {
              if (inputLookup.hasOwnProperty(p)) continue;
              inputLookup[p] = inputLookupLength++;
            }
            for (let p in output) {
              if (outputLookup.hasOwnProperty(p)) continue;
              outputLookup[p] = outputLookupLength++;
            }
          }

          for (let i = 0; i < data.length; i++) {
            const datum = data[i];
            const input = datum.input;
            const output = datum.output;
            const newInput = new Float32Array(inputLookupLength);
            const newOutput = new Float32Array(outputLookupLength);
            for (let p in input) {
              newInput[inputLookup[p]] = input.hasOwnProperty(p) ? input[p] : 0;
            }
            for (let p in output) {
              newOutput[outputLookup[p]] = output.hasOwnProperty(p) ? output[p] : 0;
            }
            result.push({input: newInput, output: newOutput});
          }

          this.inputLookup = inputLookup;
          this.inputLookupLength = inputLookupLength;
          this.outputLookup = outputLookup;
          this.outputLookupLength = outputLookupLength;
          return result;
        }
      }
    } else if (Array.isArray(data)) {
      if (Array.isArray(data[0])) {
        if (this.inputSize > 1) {
          // number[][][] to Float32Array[][][]
          if (Array.isArray(data[0][0])) {
            const result = [];
            for (let i = 0; i < data.length; i++) {
              const datum = data[i];
              const array = [];
              for (let j = 0; j < datum.length; j++) {
                array.push(Float32Array.from(datum[j]));
              }
              result.push(array);
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
            const datum = data[i];
            const array = [];
            for (let j = 0; j < datum.length; j++) {
              array.push(Float32Array.from([datum[j]]));
            }
            result.push(array);
          }
          return result;
        }
      } else {
        // number[] to Float32Array[]
        if (this.inputSize === 1) {
          const result = [];
          for (let i = 0; i < data.length; i++) {
            result.push(Float32Array.from([data[i]]));
          }
          return result;
        }
      }
    }
    throw new Error('unhandled data type');
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
    let model = this.model;
    let equations = this.model.equations;
    const inputSize = this.inputSize;
    let equation = equations[1];
    let states = equation.states;
    let jsonString = JSON.stringify(this.toJSON());

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
        .replace('product.weights = _input.weights = _this.inputValue;', inputSize === 1 ? 'product.weights = [input[_i]];' : 'product.weights = input[_i];')
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

    const src = `
  var input = ${ this.inputLookup ? 'lookupInput(rawInput)' : 'rawInput' };
  var json = ${ jsonString };
  var output = [];
  var states = [];
  var prevStates;
  var state;
  for (let _i = 0; _i < input.length; _i++) {
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
  }
  ${
    this.inputLookup
      ? 'return lookupOutput(state.product.weights)'
      : 'return state.product.weights'
  };
  ${ this.inputLookup
      ? `function lookupInput(input) {
          var table = ${ JSON.stringify(this.inputLookup) };
          var result = new Float32Array(${ Object.keys(this.inputLookup).length });
          for (var p in table) {
            result[table[p]] = input[p];
          }
          return result;
        }`
      : '' }
  ${ this.outputLookup
      ? `function lookupOutput(output) {
          debugger;
          var table = ${ JSON.stringify(this.outputLookup) };
          var result = {};
          for (var p in table) {
            result[p] = output[table[p]];
          }
          return result;
        }`
      : '' }
  
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