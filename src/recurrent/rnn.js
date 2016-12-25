import lookup from '../lookup';
import Matrix from './matrix';
import RandomMatrix from './matrix/random-matrix';
import Equation from './matrix/equation';
import sampleI from './matrix/sample-i';
import maxI from './matrix/max-i';
import softmax from './matrix/softmax';
import copy from './matrix/copy';
import { randomF } from '../utilities/random';
import zeros from '../utilities/zeros';
import Vocab from '../utilities/vocab';

export default class RNN {
  constructor(options = {}) {
    const defaults = RNN.defaults;

    for (let p in defaults) {
      if (!defaults.hasOwnProperty(p)) continue;
      this[p] = options.hasOwnProperty(p) ? options[p] : defaults[p];
    }

    if (this.vocab !== null) {
      this.inputSize = this.vocab.characters.length;
      this.inputRange = this.vocab.characters.length;
      this.outputSize = this.vocab.characters.length;
    }

    this.stepCache = {};
    this.runs = 0;
    this.totalPerplexity = null;
    this.totalCost = null;
    this.ratioClipped = null;
    this.model = null;

    this.inputLookup = null;
    this.outputLookup = null;
    this.initialize();
  }

  initialize() {
    this.model = {
      input: null,
      hiddenLayers: [],
      output: null,
      equations: [],
      allMatrices: [],
      equationConnections: [],
      outputMatrixIndex: -1
    };

    if (this.json) {
      this.fromJSON(this.json);
    } else {
      this.mapModel();
    }
  }

  createHiddenLayers() {
    let hiddenSizes = this.hiddenSizes;
    let model = this.model;
    let hiddenLayers = model.hiddenLayers;
    //0 is end, so add 1 to offset
    hiddenLayers.push(this.getModel(hiddenSizes[0], this.inputSize));
    let prevSize = hiddenSizes[0];

    for (let d = 1; d < hiddenSizes.length; d++) { // loop over depths
      let hiddenSize = hiddenSizes[d];
      hiddenLayers.push(this.getModel(hiddenSize, prevSize));
      prevSize = hiddenSize;
    }
  }

  /**
   *
   * @param {Number} hiddenSize
   * @param {Number} prevSize
   * @returns {object}
   */
  getModel(hiddenSize, prevSize) {
    return {
      //wxh
      weight: new RandomMatrix(hiddenSize, prevSize, 0.08),
      //whh
      transition: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      //bhh
      bias: new Matrix(hiddenSize, 1)
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
  getEquation(equation, inputMatrix, previousResult, hiddenLayer) {
    let relu = equation.relu.bind(equation);
    let add = equation.add.bind(equation);
    let multiply = equation.multiply.bind(equation);

    return relu(
      add(
        add(
          multiply(
            hiddenLayer.weight,
            inputMatrix
          ),
          multiply(
            hiddenLayer.transition,
            previousResult
          )
        ),
        hiddenLayer.bias
      )
    );
  }

  createInputMatrix() {
    //0 is end, so add 1 to offset
    this.model.input = new RandomMatrix(this.inputRange + 1, this.inputSize, 0.08);
  }

  createOutputMatrix() {
    let model = this.model;
    let outputSize = this.outputSize;
    let lastHiddenSize = this.hiddenSizes[this.hiddenSizes.length - 1];

    //0 is end, so add 1 to offset
    //whd
    model.outputConnector = new RandomMatrix(outputSize + 1, lastHiddenSize, 0.08);
    //0 is end, so add 1 to offset
    //bd
    model.output = new Matrix(outputSize + 1, 1);
  }

  bindEquation() {
    let model = this.model;
    let hiddenSizes = this.hiddenSizes;
    let hiddenLayers = model.hiddenLayers;
    let equation = new Equation();
    let outputs = [];
    let equationConnection = model.equationConnections.length > 0
      ? model.equationConnections[model.equationConnections.length - 1]
      : hiddenSizes.map((size) => new Matrix(hiddenSizes[0], 1))
      ;

      // 0 index
    let output = this.getEquation(equation, equation.inputMatrixToRow(model.input), equationConnection[0], hiddenLayers[0]);
    outputs.push(output);
    // 1+ indexes
    for (let i = 1, max = hiddenSizes.length; i < max; i++) {
      output = this.getEquation(equation, output, equationConnection[i], hiddenLayers[i]);
      outputs.push(output);
    }

    model.equationConnections.push(outputs);
    equation.add(equation.multiply(model.outputConnector, output), model.output);
    model.allMatrices = model.allMatrices.concat(equation.allMatrices);
    model.equations.push(equation);
  }

  mapModel() {
    let model = this.model;
    let hiddenLayers = model.hiddenLayers;
    let allMatrices = model.allMatrices;

    this.createInputMatrix();
    if (!model.input) throw new Error('net.model.input not set');
    allMatrices.push(model.input);

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
    model.outputMatrixIndex = allMatrices.length;
    allMatrices.push(model.output);
  }

  /**
   *
   * @param {String[]} input
   * @param {Number} [learningRate]
   * @returns {*}
   */
  trainPattern(input, learningRate = null) {
    const err = this.runInput(input);
    this.runBackpropagate(input);
    this.step(learningRate);
    return err;
  }

  /**
   *
   * @param {Number[]} input
   * @returns {number}
   */
  runInput(input) {
    this.runs++;
    let model = this.model;
    let max = input.length;
    let log2ppl = 0;
    let cost = 0;

    let equation;
    while (model.equations.length <= input.length + 1) {//first and last are zeros
      this.bindEquation();
    }
    for (let inputIndex = -1, inputMax = input.length; inputIndex < inputMax; inputIndex++) {
      // start and end tokens are zeros
      equation = model.equations[inputIndex + 1];

      let source = (inputIndex === -1 ? 0 : input[inputIndex] + 1); // first step: start with START token
      let target = (inputIndex === max - 1 ? 0 : input[inputIndex + 1] + 1); // last step: end with END token
      let output = equation.run(source);
      // set gradients into log probabilities
      let logProbabilities = output; // interpret output as log probabilities
      let probabilities = softmax(output); // compute the softmax probabilities

      log2ppl += -Math.log2(probabilities.weights[target]); // accumulate base 2 log prob and do smoothing
      cost += -Math.log(probabilities.weights[target]);

      // write gradients into log probabilities
      logProbabilities.recurrence = probabilities.weights;
      logProbabilities.recurrence[target] -= 1;
    }

    this.totalCost = cost;
    return this.totalPerplexity = Math.pow(2, log2ppl / (max - 1));
  }

  /**
   * @param {Number[]} input
   */
  runBackpropagate(input) {
    let i = input.length;
    let model = this.model;
    let equations = model.equations;
    while(i > 0) {
      equations[i].runBackpropagate(input[i - 1] + 1);
      i--;
    }
    equations[0].runBackpropagate(0);
  }

  /**
   *
   * @param {Number} [learningRate]
   */
  step(learningRate = null) {
    // perform parameter update
    //TODO: still not sure if this is ready for learningRate
    let stepSize = this.learningRate;
    let regc = this.regc;
    let clipval = this.clipval;
    let model = this.model;
    let numClipped = 0;
    let numTot = 0;
    let allMatrices = model.allMatrices;
    let outputMatrixIndex = model.outputMatrixIndex;
    let matrixIndexes = allMatrices.length;
    for (let matrixIndex = 0; matrixIndex < matrixIndexes; matrixIndex++) {
      let matrix = allMatrices[matrixIndex];
      if (!(matrixIndex in this.stepCache)) {
        this.stepCache[matrixIndex] = new Matrix(matrix.rows, matrix.columns);
      }
      let cache = this.stepCache[matrixIndex];

      //if we are in an equation, reset the weights and recurrence to 0, to prevent exploding gradient problem
      if (matrixIndex > outputMatrixIndex) {
        for (let i = 0, n = matrix.weights.length; i < n; i++) {
          matrix.weights[i] = 0;
          matrix.recurrence[i] = 0;
        }
        continue;
      }

      for (let i = 0, n = matrix.weights.length; i < n; i++) {
        // rmsprop adaptive learning rate
        let mdwi = matrix.recurrence[i];
        cache.weights[i] = cache.weights[i] * this.decayRate + (1 - this.decayRate) * mdwi * mdwi;
        // gradient clip
        if (mdwi > clipval) {
          mdwi = clipval;
          numClipped++;
        }
        if (mdwi < -clipval) {
          mdwi = -clipval;
          numClipped++;
        }
        numTot++;

        // update (and regularize)
        matrix.weights[i] = matrix.weights[i] + -stepSize * mdwi / Math.sqrt(cache.weights[i] + this.smoothEps) - regc * matrix.weights[i];
        matrix.recurrence[i] = 0; // reset gradients for next iteration
      }
    }
    this.ratioClipped = numClipped / numTot;
  }

  /**
   *
   * @param {Number[]|*} [rawInput]
   * @param {Number} [maxPredictionLength]
   * @param {Boolean} [isSampleI]
   * @param {Number} temperature
   * @returns {*}
   */
  run(rawInput = [], maxPredictionLength = 100, isSampleI = false, temperature = 1) {
    const input = this.formatDataIn(rawInput);
    let model = this.model;
    let equation;
    let i = 0;
    let output = [];
    while (model.equations.length < maxPredictionLength) {
      this.bindEquation();
    }
    while (true) {
      let previousIndex = (i === 0
        ? 0
        : i < input.length
          ? input[i - 1] + 1
          : output[i - 1]);

      equation = model.equations[i];
      // sample predicted letter
      let outputIndex = equation.run(previousIndex);

      let logProbabilities = new Matrix(model.output.rows, model.output.columns);
      copy(logProbabilities, outputIndex);
      if (temperature !== 1 && isSampleI) {
        // scale log probabilities by temperature and re-normalize
        // if temperature is high, logprobs will go towards zero
        // and the softmax outputs will be more diffuse. if temperature is
        // very low, the softmax outputs will be more peaky
        for (let q = 0, nq = logProbabilities.weights.length; q < nq; q++) {
          logProbabilities.weights[q] /= temperature;
        }
      }

      let probs = softmax(logProbabilities);
      let nextIndex = (isSampleI
        ? sampleI(probs)
        : maxI(probs));

      i++;
      if (nextIndex === 0) {
        //console.log('end predicted');
        // END token predicted, break out
        break;
      }
      if (i >= maxPredictionLength) {
        //console.log('something is wrong');
        // something is wrong
        break;
      }

      output.push(nextIndex);
    }
    return this.formatDataOut(input, output.slice(input.length).map(value => value - 1));
  }

  /**
   *
   * @param {Object[]} data a collection of objects: `{input: 'string', output: 'string'}`
   * @param {Object} [options]
   * @returns {{error: number, iterations: number}}
   */
  train(data, options = {}) {
    options = Object.assign({}, RNN.trainDefaults, options);
    let iterations = options.iterations;
    let errorThresh = options.errorThresh;
    let log = options.log === true ? console.log : options.log;
    let logPeriod = options.logPeriod;
    let learningRate = options.learningRate || this.learningRate;
    let callback = options.callback;
    let callbackPeriod = options.callbackPeriod;

    if (!options.keepNetworkIntact) {
      this.initialize();
    }

    let error = 1;
    let i;

    if (this.hasOwnProperty('setupData')) {
      data = this.setupData(data);
    }

    for (i = 0; i < iterations && error > errorThresh; i++) {
      let sum = 0;
      for (let j = 0; j < data.length; j++) {
        let err = this.trainPattern(data[j], learningRate);
        sum += err;
      }
      error = sum / data.length;

      if (log && (i % logPeriod == 0)) {
        log('iterations:', i, 'training error:', error);
      }
      if (callback && (i % callbackPeriod == 0)) {
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
   * @returns {
   *  {
   *    error: number,
   *    misclasses: Array
   *  }
   * }
   */
  test(data) {
    throw new Error('not yet implemented');
  }

  /**
   *
   * @returns {Object}
   */
  toJSON() {
    const defaults = RNN.defaults;
    let model = this.model;
    let options = {};
    for (let p in defaults) {
      options[p] = this[p];
    }

    return {
      type: this.constructor.name,
      options: options,
      input: model.input.toJSON(),
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

  toJSONString() {
    return JSON.stringify(this.toJSON());
  }

  fromJSON(json) {
    this.json = json;
    const defaults = RNN.defaults;
    let model = this.model;
    let options = json.options;
    let allMatrices = model.allMatrices;
    model.input = Matrix.fromJSON(json.input);
    allMatrices.push(model.input);
    model.hiddenLayers = json.hiddenLayers.map((hiddenLayer) => {
      let layers = {};
      for (let p in hiddenLayer) {
        layers[p] = Matrix.fromJSON(hiddenLayer[p]);
        allMatrices.push(layers[p]);
      }
      return layers;
    });
    model.outputConnector = Matrix.fromJSON(json.outputConnector);
    model.output = Matrix.fromJSON(json.output);
    allMatrices.push(model.outputConnector);
    model.outputMatrixIndex = allMatrices.length;
    allMatrices.push(model.output);

    for (let p in defaults) {
      if (!defaults.hasOwnProperty(p)) continue;
      this[p] = options.hasOwnProperty(p) ? options[p] : defaults[p];
    }

    if (options.hasOwnProperty('vocab') && options.vocab !== null) {
      this.vocab = Vocab.fromJSON(options.vocab);
      delete options.vocab;
    }

    this.bindEquation();
  }

  fromJSONString(json) {
    return this.fromJSON(JSON.parse(json));
  }

  /**
   *
   * @returns {Function}
   */
  toFunction() {
    let model = this.model;
    let equations = this.model.equations;
    let equation = equations[1];
    let states = equation.states;
    let modelAsString = JSON.stringify(this.toJSON());

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

      if (m === model.input) return `model.input`;
      if (m === model.outputConnector) return `model.outputConnector`;
      if (m === model.output) return `model.output`;

      for (let i = 0, max = model.hiddenLayers.length; i < max; i++) {
        let hiddenLayer = model.hiddenLayers[i];
        for (let p in hiddenLayer) {
          if (!hiddenLayer.hasOwnProperty(p)) continue;
          if (hiddenLayer[p] !== m) continue;
          return `model.hiddenLayers[${ i }].${ p }`;
        }
      }

      return matrixOrigin(m, stateIndex);
    }

    function toInner(fnString) {
      //crude, but should be sufficient for now
      // function() { body }
      fnString = fnString.toString().split('{');
      fnString.shift();
      // body }
      fnString = fnString.join('{');
      fnString = fnString.split('}');
      fnString.pop();
      // body
      return fnString.join('}').split('\n').join('\n        ');
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
          `        case '${ fnName }': //compiled from ${ fileName(fnName) }
          ${ toInner(state.forwardFn.toString()) }
          break;`
        );
      }
    }

    return new Function('input', 'maxPredictionLength', '_sampleI', 'temperature', `
  if (typeof input === 'undefined') input = [];
  if (typeof maxPredictionLength === 'undefined') maxPredictionLength = 100;
  if (typeof _sampleI === 'undefined') _sampleI = false;
  if (typeof temperature === 'undefined') temperature = 1;
  
  var model = ${ modelAsString };
  var _i = 0;
  var result = input.slice(0);
  var states = [];
  var prevStates;
  while (true) {
    // sample predicted letter
    var ix = result.length === 0 ? 0 : result[result.length - 1]; // first step: start with START token
    var rowPluckIndex = ix; //connect up to rowPluck
    prevStates = states;
    states = [];
    ${ statesRaw.join(';\n    ') };
    for (var stateIndex = 0, stateMax = ${ statesRaw.length }; stateIndex < stateMax; stateIndex++) {
      var state = states[stateIndex];
      var product = state.product;
      var left = state.left;
      var right = state.right;
      
      switch (state.name) {
${ innerFunctionsSwitch.join('\n') }
      }
    }
    
    var logProbabilities = state.product;
    if (temperature !== 1 && _sampleI) {
      // scale log probabilities by temperature and renormalize
      // if temperature is high, logprobs will go towards zero
      // and the softmax outputs will be more diffuse. if temperature is
      // very low, the softmax outputs will be more peaky
      for (var q = 0, nq = logProbabilities.weights.length; q < nq; q++) {
        logProbabilities.weights[q] /= temperature;
      }
    }

    var probs = softmax(logProbabilities);

    if (_sampleI) {
      ix = sampleI(probs);
    } else {
      ix = maxI(probs);
    }
    
    _i++;
    if (ix === 0) {
      // END token predicted, break out
      break;
    }
    if (_i >= maxPredictionLength) {
      // something is wrong
      break;
    }

    result.push(ix);
  }

  return result.map(function(value) { return value - 1; });
  
  function Matrix(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.weights = zeros(rows * columns);
    this.recurrence = zeros(rows * columns);
  }
  ${ zeros.toString() }
  ${ softmax.toString() }
  ${ randomF.toString() }
  ${ sampleI.toString() }
  ${ maxI.toString() }`);
  }
}

RNN.defaults = {
  // hidden size should be a list
  inputSize: 20,
  inputRange: 20,
  hiddenSizes:[20,20],
  outputSize: 20,
  learningRate: 0.01,
  decayRate: 0.999,
  smoothEps: 1e-8,
  regc: 0.000001,
  clipval: 5,
  json: null,
  setupData: function(data) {
    if (!data[0].hasOwnProperty('input') || !data[0].hasOwnProperty('output')) {
      return data;
    }
    let characters = '';
    for (let i = 0; i < data.length; i++) {
      characters += data[i].input;
      characters += data[i].output;
    }
    this.vocab = Vocab.fromStringInputOutput(characters);
    const result = [];
    for (let i = 0, max = data.length; i < max; i++) {
      result.push(this.formatDataIn(data[i].input, data[i].output));
    }
    return result;
  },
  formatDataIn: function(input, output = null) {
    if (this.vocab !== null) {
      if (this.vocab.indexTable.hasOwnProperty('stop-input')) {
        return this.vocab.toIndexesInputOutput(input, output);
      } else {
        return this.vocab.toIndexes(input);
      }
    }
    return input;
  },
  formatDataOut: function(input, output) {
    if (this.vocab !== null) {
      return this.vocab
        .toCharacters(output)
        .join('');
    }
    return output;
  },
  vocab: null
};

RNN.trainDefaults = {
  iterations: 20000,
  errorThresh: 0.005,
  log: false,
  logPeriod: 10,
  learningRate: 0.3,
  callback: null,
  callbackPeriod: 10,
  keepNetworkIntact: false
};