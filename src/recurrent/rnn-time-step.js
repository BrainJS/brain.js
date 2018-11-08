import Matrix from './matrix';
import RandomMatrix from './matrix/random-matrix';
import Equation from './matrix/equation';
import RNN from './rnn';
import zeros from '../utilities/zeros';
import softmax from './matrix/softmax';
import {randomF} from '../utilities/random';
import sampleI from './matrix/sample-i';
import maxI from './matrix/max-i';

export default class RNNTimeStep extends RNN {
  createInputMatrix() {
    this.model.input = new RandomMatrix(this.inputSize, 1, 0.08);
  }

  createOutputMatrix() {
    let model = this.model;
    let outputSize = this.outputSize;
    let lastHiddenSize = this.hiddenLayers[this.hiddenLayers.length - 1];

    //whd
    model.outputConnector = new RandomMatrix(outputSize, lastHiddenSize, 0.08);
    //bd
    model.output = new Matrix(outputSize, 1);
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
    let output = this.getEquation(equation, equation.input(model.input), equationConnection[0], layers[0]);
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

  runBackpropagate() {
    for (let i = this.model.equations.length - 1; i > -1; i--) {
      this.model.equations[i].runBackpropagate();
    }
  }


  /**
   *
   * @param {Number[]|Number[][]} [input]
   * @returns {Number[]|Number}
   */
  run(input = []) {
    if (this.inputSize === 1) {
      this.run = this.runNumbers;
      return this.runNumbers(input);
    }
    this.run = this.runArrays;
    return this.runArrays(input);
  }

  /**
   *
   * @param {Object[]|String[]} data an array of objects: `{input: 'string', output: 'string'}` or an array of strings
   * @param {Object} [options]
   * @returns {{error: number, iterations: number}}
   */
  train(data, options = {}) {
    if (data[0].input) {
      if (Array.isArray(data[0].input[0])) {
        this.trainInput = this.trainInputOutputArray;
      } else {
        this.trainInput = this.trainInputOutput;
      }
    } else if (Array.isArray(data[0])) {
      if (Array.isArray(data[0][0])) {
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

    options = Object.assign({}, this.constructor.trainDefaults, options);
    const iterations = options.iterations;
    const errorThresh = options.errorThresh;
    const log = options.log === true ? console.log : options.log;
    const logPeriod = options.logPeriod;
    const learningRate = options.learningRate || this.learningRate;
    const callback = options.callback;
    const callbackPeriod = options.callbackPeriod;
    let error = Infinity;
    let i;

    if (this.hasOwnProperty('setupData')) {
      data = this.setupData(data);
    }

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
      errorSum += equations[i].predictTarget([input[i]], [input[i + 1]]);
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
      errorSum += equations[equationIndex++].predictTarget([input[inputIndex]], [input[inputIndex + 1]]);
    }
    errorSum += equations[equationIndex++].predictTarget([input[input.length - 1]], [output[0]]);
    for (let outputIndex = 0, max = output.length - 1; outputIndex < max; outputIndex++) {
      errorSum += equations[equationIndex++].predictTarget([output[outputIndex]], [output[outputIndex + 1]]);
    }
    this.end();
    return errorSum / totalSize;
  }

  trainInputOutputArray(set) {
    const model = this.model;
    const input = set.input;
    const output = set.output;
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
    while (model.equations.length < input.length) {
      this.bindEquation();
    }
    let lastOutput;
    for (let i = 0; i < input.length; i++) {
      let outputMatrix = model.equations[i].runInput(input[i]);
      lastOutput = outputMatrix.weights;
    }
    return lastOutput;
  }

  end() {
    const endEquation = this.model.equations[this.model.equations.length - 1];
    endEquation.runInput(new Float32Array(this.inputSize));
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

      if (m === model.input) return `json.input`;
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
        .replace('product.weights = _this.inputValue;', inputSize === 1 ? 'product.weights = [input[_i]];' : 'product.weights = input[_i];')
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
  if (typeof rawInput === 'undefined') rawInput = [];
  ${ (this.dataFormatter !== null) ? this.dataFormatter.toFunctionString() : '' }
  
  var input = ${
      (this.dataFormatter !== null && typeof this.formatDataIn === 'function')
        ? 'formatDataIn(rawInput)'
        : 'rawInput'
      };
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
    (this.dataFormatter !== null && typeof this.formatDataOut === 'function')
      ? `return formatDataOut(input, ${ this.outputSize === 1 ? 'state.product.weights[0]' : 'state.product.weights' })`
      : `return ${ this.outputSize === 1 ? 'state.product.weights[0]' : 'state.product.weights' }`
  };
  function Matrix(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.weights = zeros(rows * columns);
  }
  ${ this.dataFormatter !== null && typeof this.formatDataIn === 'function'
        ? `function formatDataIn(input, output) { ${
          toInner(this.formatDataIn.toString())
            .replace(/this[.]dataFormatter[\n\s]+[.]/g, '')
            .replace(/this[.]dataFormatter[.]/g, '')
            .replace(/this[.]dataFormatter/g, 'true')
          } }`
        : '' }
  ${ this.dataFormatter !== null && typeof this.formatDataOut === 'function'
        ? `function formatDataOut(input, output) { ${
          toInner(this.formatDataOut.toString())
            .replace(/this[.]dataFormatter[\n\s]+[.]/g, '')
            .replace(/this[.]dataFormatter[.]/g, '')
            .replace(/this[.]dataFormatter/g, 'true')
          } }`
        : '' }
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
  clipval: 5,
  dataFormatter: null
};

RNNTimeStep.trainDefaults = RNN.trainDefaults;