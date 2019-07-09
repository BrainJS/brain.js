const Matrix = require('./matrix');
const RandomMatrix = require('./matrix/random-matrix');
const Equation = require('./matrix/equation');
const sampleI = require('./matrix/sample-i');
const maxI = require('./matrix/max-i');
const softmax = require('./matrix/softmax');
const copy = require('./matrix/copy');
const randomFloat = require('../utilities/random').randomFloat;
const zeros = require('../utilities/zeros');
const DataFormatter = require('../utilities/data-formatter');

class RNN {
  constructor(options = {}) {
    const { defaults } = this.constructor;

    Object.assign(this, defaults, options);

    this.stepCache = {};
    this.runs = 0;
    this.totalCost = null;
    this.ratioClipped = null;
    this.model = null;

    this.initialLayerInputs = this.hiddenSizes.map(
      () => new Matrix(this.hiddenSizes[0], 1)
    );
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
    };

    if (this.dataFormatter !== null) {
      this.outputSize = this.dataFormatter.characters.length;
      this.inputRange = this.outputSize;
      this.inputSize = this.inputRange;
    }

    if (this.json) {
      this.fromJSON(this.json);
    } else {
      this.mapModel();
    }
  }

  createHiddenLayers() {
    const { model, hiddenSizes } = this;
    const { hiddenLayers } = model;
    // 0 is end, so add 1 to offset
    hiddenLayers.push(RNN.getModel(hiddenSizes[0], this.inputSize));
    let prevSize = hiddenSizes[0];

    for (let d = 1; d < hiddenSizes.length; d++) {
      // loop over depths
      const hiddenSize = hiddenSizes[d];
      hiddenLayers.push(RNN.getModel(hiddenSize, prevSize));
      prevSize = hiddenSize;
    }
  }

  /**
   *
   * @param {Number} hiddenSize
   * @param {Number} prevSize
   * @returns {object}
   */
  static getModel(hiddenSize, prevSize) {
    return {
      // wxh
      weight: new RandomMatrix(hiddenSize, prevSize, 0.08),
      // whh
      transition: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      // bhh
      bias: new Matrix(hiddenSize, 1),
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
  static getEquation(equation, inputMatrix, previousResult, hiddenLayer) {
    const relu = equation.relu.bind(equation);
    const add = equation.add.bind(equation);
    const multiply = equation.multiply.bind(equation);

    return relu(
      add(
        add(
          multiply(hiddenLayer.weight, inputMatrix),
          multiply(hiddenLayer.transition, previousResult)
        ),
        hiddenLayer.bias
      )
    );
  }

  createInputMatrix() {
    // 0 is end, so add 1 to offset
    this.model.input = new RandomMatrix(
      this.inputRange + 1,
      this.inputSize,
      0.08
    );
  }

  createOutputMatrix() {
    const { model, outputSize } = this.model;
    const lastHiddenSize = this.hiddenSizes[this.hiddenSizes.length - 1];

    // 0 is end, so add 1 to offset
    // whd
    model.outputConnector = new RandomMatrix(
      outputSize + 1,
      lastHiddenSize,
      0.08
    );
    // 0 is end, so add 1 to offset
    // bd
    model.output = new Matrix(outputSize + 1, 1);
  }

  bindEquation() {
    const { model, hiddenSizes } = this.model;
    const { hiddenLayers } = model;
    const equation = new Equation();
    const outputs = [];
    const equationConnection =
      model.equationConnections.length > 0
        ? model.equationConnections[model.equationConnections.length - 1]
        : this.initialLayerInputs;

    // 0 index
    let output = this.getEquation(
      equation,
      equation.inputMatrixToRow(model.input),
      equationConnection[0],
      hiddenLayers[0]
    );
    outputs.push(output);
    // 1+ indices
    for (let i = 1, max = hiddenSizes.length; i < max; i++) {
      output = this.getEquation(
        equation,
        output,
        equationConnection[i],
        hiddenLayers[i]
      );
      outputs.push(output);
    }

    model.equationConnections.push(outputs);
    equation.add(equation.multiply(model.outputConnector, output), model.output);
    model.equations.push(equation);
  }

  mapModel() {
    const { model } = this;
    const { hiddenLayers, allMatrices } = model;

    this.createInputMatrix();
    if (!model.input) throw new Error('net.model.input not set');
    allMatrices.push(model.input);

    this.createHiddenLayers();
    if (!model.hiddenLayers.length) throw new Error('net.hiddenLayers not set');
    for (let i = 0, max = hiddenLayers.length; i < max; i++) {
      Object.values(hiddenLayers[i]).forEach(val => {
        allMatrices.push(val);
      });
    }

    this.createOutputMatrix();
    if (!model.outputConnector)
      throw new Error('net.model.outputConnector not set');
    if (!model.output) throw new Error('net.model.output not set');

    allMatrices.push(model.outputConnector);
    allMatrices.push(model.output);
  }

  /**
   *
   * @param {Number[]} input
   * @param {Number} [learningRate]
   * @returns {number}
   */
  trainPattern(input, learningRate = null) {
    const error = this.runInput(input);
    this.runBackpropagate(input);
    this.step(learningRate);
    return error;
  }

  /**
   *
   * @param {Number[]} input
   * @returns {number}
   */
  runInput(input) {
    this.runs++;
    const { model } = this;
    const max = input.length;
    let log2ppl = 0;
    let cost = 0;
    let equation;
    while (model.equations.length <= input.length + 1) {
      // last is zero
      this.bindEquation();
    }
    for (
      let inputIndex = -1, inputMax = input.length;
      inputIndex < inputMax;
      inputIndex++
    ) {
      // start and end tokens are zeros
      const equationIndex = inputIndex + 1;
      equation = model.equations[equationIndex];

      const source = inputIndex === -1 ? 0 : input[inputIndex] + 1; // first step: start with START token
      const target = inputIndex === max - 1 ? 0 : input[inputIndex + 1] + 1; // last step: end with END token
      const output = equation.run(source);
      // set gradients into log probabilities
      const logProbabilities = output; // interpret output as log probabilities
      const probabilities = softmax(output); // compute the softmax probabilities

      log2ppl += -Math.log2(probabilities.weights[target]); // accumulate base 2 log prob and do smoothing
      cost += -Math.log(probabilities.weights[target]);
      // write gradients into log probabilities
      logProbabilities.deltas = probabilities.weights.slice(0);
      logProbabilities.deltas[target] -= 1;
    }

    this.totalCost = cost;
    return 2 ** (log2ppl / (max - 1));
  }

  /**
   * @param {Number[]} input
   */
  runBackpropagate(input) {
    let i = input.length;
    const { model } = this;
    const { equations } = model;
    while (i > 0) {
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
    // TODO: still not sure if this is ready for learningRate
    const stepSize = learningRate || this.learningRate;
    const { regc, clipval, model } = this;
    let numClipped = 0;
    let numTot = 0;
    const { allMatrices } = model;
    for (let matrixIndex = 0; matrixIndex < allMatrices.length; matrixIndex++) {
      const matrix = allMatrices[matrixIndex];
      const { weights, deltas } = matrix;
      if (!(matrixIndex in this.stepCache)) {
        this.stepCache[matrixIndex] = zeros(matrix.rows * matrix.columns);
      }
      const cache = this.stepCache[matrixIndex];
      for (let i = 0; i < weights.length; i++) {
        let r = deltas[i];
        const w = weights[i];
        // rmsprop adaptive learning rate
        cache[i] = cache[i] * this.decayRate + (1 - this.decayRate) * r * r;
        // gradient clip
        if (r > clipval) {
          r = clipval;
          numClipped++;
        }
        if (r < -clipval) {
          r = -clipval;
          numClipped++;
        }
        numTot++;
        // update (and regularize)
        weights[i] =
          w + (-stepSize * r) / Math.sqrt(cache[i] + this.smoothEps) - regc * w;
      }
    }
    this.ratioClipped = numClipped / numTot;
  }

  /**
   *
   * @returns boolean
   */
  get isRunnable() {
    if (this.model.equations.length === 0) {
      console.error(`No equations bound, did you run train()?`);
      return false;
    }

    return true;
  }

  /**
   *
   * @param {Number[]|*} [rawInput]
   * @param {Number} [maxPredictionLength]
   * @param {Boolean} [isSampleI]
   * @param {Number} temperature
   * @returns {*}
   */
  run(
    rawInput = [],
    maxPredictionLength = 100,
    isSampleI = false,
    temperature = 1
  ) {
    if (!this.isRunnable) return null;
    const input = this.formatDataIn(rawInput);
    const { model } = this;
    const output = [];
    let i = 0;
    while (model.equations.length < maxPredictionLength) {
      this.bindEquation();
    }
    while (true) {
      /* eslint-disable */
      const previousIndex =
        i === 0 ? 0 : i < input.length ? input[i - 1] + 1 : output[i - 1]
      /* eslint-enable */
      const equation = model.equations[i];
      // sample predicted letter
      const outputMatrix = equation.run(previousIndex);
      const logProbabilities = new Matrix(
        model.output.rows,
        model.output.columns
      );
      copy(logProbabilities, outputMatrix);
      if (temperature !== 1 && isSampleI) {
        /**
         * scale log probabilities by temperature and re-normalize
         * if temperature is high, logProbabilities will go towards zero
         * and the softmax outputs will be more diffuse. if temperature is
         * very low, the softmax outputs will be more peaky
         */
        for (let j = 0, max = logProbabilities.weights.length; j < max; j++) {
          logProbabilities.weights[j] /= temperature;
        }
      }

      const probs = softmax(logProbabilities);
      const nextIndex = isSampleI ? sampleI(probs) : maxI(probs);

      i++;
      if (nextIndex === 0) {
        // END token predicted, break out
        break;
      }
      if (i >= maxPredictionLength) {
        // something is wrong
        break;
      }

      output.push(nextIndex);
    }

    /**
     * we slice the input length here, not because output contains it, but it will be erroneous as we are sending the
     * network what is contained in input, so the data is essentially guessed by the network what could be next, till it
     * locks in on a value.
     * Kind of like this, values are from input:
     * 0 -> 4 (or in English: "beginning on input" -> "I have no idea? I'll guess what they want next!")
     * 2 -> 2 (oh how interesting, I've narrowed down values...)
     * 1 -> 9 (oh how interesting, I've now know what the values are...)
     * then the output looks like: [4, 2, 9,...]
     * so we then remove the erroneous data to get our true output
     */
    return this.formatDataOut(
      input,
      output.slice(input.length).map(value => value - 1)
    );
  }

  /**
   *
   * @param {Object[]|String[]} data an array of objects: `{input: 'string', output: 'string'}` or an array of strings
   * @param {Object} [options]
   * @returns {{error: number, iterations: number}}
   */
  train(data, options = {}) {
    options = Object.assign({}, this.constructor.trainDefaults, options);
    const {
      iterations,
      errorThresh,
      logPeriod,
      callback,
      callbackPeriod,
    } = options;

    const log = options.log === true ? console.log : options.log;
    const learningRate = options.learningRate || this.learningRate;
    let error = Infinity;
    let i;

    if (this.hasOwnProperty('setupData')) {
      data = this.setupData(data);
    }

    if (!options.keepNetworkIntact) {
      this.initialize();
    }

    for (i = 0; i < iterations && error > errorThresh; i++) {
      let sum = 0;
      for (let j = 0; j < data.length; j++) {
        const err = this.trainPattern(data[j], learningRate);
        sum += err;
      }
      error = sum / data.length;

      if (Number.isNaN(error))
        throw new Error(
          'network error rate is unexpected NaN, check network configurations and try again'
        );
      if (log && i % logPeriod === 0) {
        log('iterations:', i, 'training error:', error);
      }
      if (callback && i % callbackPeriod === 0) {
        callback({ error, iterations: i });
      }
    }

    return {
      error,
      iterations: i,
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
  test() {
    throw new Error(`${this.constructor.name}-test is not yet implemented`);
  }

  /**
   *
   * @returns {Object}
   */
  toJSON() {
    const { defaults } = this.constructor;
    const { model } = this;
    const options = {};

    Object.keys(defaults).forEach(p => {
      options[p] = this[p];
    });

    return {
      type: this.constructor.name,
      options,
      input: model.input.toJSON(),
      hiddenLayers: model.hiddenLayers.map(hiddenLayer => {
        const layers = {};

        Object.keys(hiddenLayer).forEach(p => {
          layers[p] = hiddenLayer[p].toJSON();
        });

        return layers;
      }),
      outputConnector: this.model.outputConnector.toJSON(),
      output: this.model.output.toJSON(),
    };
  }

  toJSONString() {
    return JSON.stringify(this.toJSON());
  }

  fromJSON(json) {
    this.json = json;
    const { defaults } = this.constructor;
    const { model } = this.model;
    const { options } = json;
    const { allMatrices } = model;

    model.input = Matrix.fromJSON(json.input);
    allMatrices.push(model.input);
    model.hiddenLayers = json.hiddenLayers.map(hiddenLayer => {
      const layers = {};

      Object.keys(hiddenLayer).forEach(p => {
        layers[p] = Matrix.fromJSON(hiddenLayer[p]);
        allMatrices.push(layers[p]);
      });

      return layers;
    });
    model.outputConnector = Matrix.fromJSON(json.outputConnector);
    model.output = Matrix.fromJSON(json.output);
    allMatrices.push(model.outputConnector);
    allMatrices.push(model.output);

    Object.keys(defaults).forEach(p => {
      this[p] = options.hasOwnProperty(p) ? options[p] : defaults[p];
    });

    if (
      options.hasOwnProperty('dataFormatter') &&
      options.dataFormatter !== null
    ) {
      this.dataFormatter = DataFormatter.fromJSON(options.dataFormatter);
      delete options.dataFormatter;
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
    const { model } = this;
    const { equations } = this.model;
    const equation = equations[1];
    const { states } = equation;
    const jsonString = JSON.stringify(this.toJSON());

    function previousConnectionIndex(m) {
      const connection = model.equationConnections[0];
      const { states0 } = equations[0];
      for (let i = 0, max = states0.length; i < max; i++) {
        if (states0[i].product === m) {
          return i;
        }
      }
      return connection.indexOf(m);
    }

    function matrixOrigin(m, stateIndex) {
      for (let i = 0, max = states.length; i < max; i++) {
        const state = states[i];

        if (i === stateIndex) {
          const j = previousConnectionIndex(m);
          switch (m) {
            case state.left:
              if (j > -1) {
                return `typeof prevStates[${j}] === 'object' ? prevStates[${j}].product : new Matrix(${
                  m.rows
                }, ${m.columns})`;
              }

              break;
            case state.right:
              if (j > -1) {
                return `typeof prevStates[${j}] === 'object' ? prevStates[${j}].product : new Matrix(${
                  m.rows
                }, ${m.columns})`;
              }
              break;
            case state.product:
              return `new Matrix(${m.rows}, ${m.columns})`;
            default:
              throw Error('unknown state');
          }
        }

        if (m === state.product) return `states[${i}].product`;
        if (m === state.right) return `states[${i}].right`;
        if (m === state.left) return `states[${i}].left`;
      }

      return null;
    }

    function matrixToString(m, stateIndex) {
      if (!m || !m.rows || !m.columns) return 'null';

      if (m === model.input) return `json.input`;
      if (m === model.outputConnector) return `json.outputConnector`;
      if (m === model.output) return `json.output`;

      for (let i = 0, max = model.hiddenLayers.length; i < max; i++) {
        const hiddenLayer = model.hiddenLayers[i];

        // eslint-disable-next-line
        Object.keys(hiddenLayer).forEach(p => {
          if (hiddenLayer[p] === m) {
            return `json.hiddenLayers[${i}].${p}`;
          }
        });
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
      return fnString
        .join('}')
        .split('\n')
        .join('\n        ')
        .replace('product.deltas[i] = 0;', '')
        .replace('product.deltas[column] = 0;', '')
        .replace('left.deltas[leftIndex] = 0;', '')
        .replace('right.deltas[rightIndex] = 0;', '')
        .replace('product.deltas = left.deltas.slice(0);', '');
    }

    function fileName(fnName) {
      return `src/recurrent/matrix/${fnName.replace(
        /[A-Z]/g,
        value => `-${value.toLowerCase()}`
      )}.js`;
    }

    const statesRaw = [];
    const usedFunctionNames = {};
    const innerFunctionsSwitch = [];
    for (let i = 0, max = states.length; i < max; i++) {
      const state = states[i];
      statesRaw.push(`states[${i}] = {
      name: '${state.forwardFn.name}',
      left: ${matrixToString(state.left, i)},
      right: ${matrixToString(state.right, i)},
      product: ${matrixToString(state.product, i)}
    }`);

      const fnName = state.forwardFn.name;
      if (!usedFunctionNames[fnName]) {
        usedFunctionNames[fnName] = true;
        innerFunctionsSwitch.push(
          `        case '${fnName}': //compiled from ${fileName(fnName)}
          ${toInner(state.forwardFn.toString())}
          break;`
        );
      }
    }

    const src = `
  if (typeof rawInput === 'undefined') rawInput = [];
  if (typeof maxPredictionLength === 'undefined') maxPredictionLength = 100;
  if (typeof isSampleI === 'undefined') isSampleI = false;
  if (typeof temperature === 'undefined') temperature = 1;
  ${this.dataFormatter !== null ? this.dataFormatter.toFunctionString() : ''}

  var input = ${
    this.dataFormatter !== null && typeof this.formatDataIn === 'function'
      ? 'formatDataIn(rawInput)'
      : 'rawInput'
  };
  var json = ${jsonString};
  var _i = 0;
  var output = [];
  var states = [];
  var prevStates;
  while (true) {
    var previousIndex = (_i === 0
        ? 0
        : _i < input.length
          ? input[_i - 1] + 1
          : output[_i - 1])
          ;
    var rowPluckIndex = previousIndex;
    prevStates = states;
    states = [];
    ${statesRaw.join(';\n    ')};
    for (var stateIndex = 0, stateMax = ${
      statesRaw.length
    }; stateIndex < stateMax; stateIndex++) {
      var state = states[stateIndex];
      var product = state.product;
      var left = state.left;
      var right = state.right;

      switch (state.name) {
${innerFunctionsSwitch.join('\n')}
      }
    }

    var logProbabilities = state.product;
    if (temperature !== 1 && isSampleI) {
      for (var q = 0, nq = logProbabilities.weights.length; q < nq; q++) {
        logProbabilities.weights[q] /= temperature;
      }
    }

    var probs = softmax(logProbabilities);
    var nextIndex = isSampleI ? sampleI(probs) : maxI(probs);

    _i++;
    if (nextIndex === 0) {
      break;
    }
    if (_i >= maxPredictionLength) {
      break;
    }

    output.push(nextIndex);
  }
  ${
    this.dataFormatter !== null && typeof this.formatDataOut === 'function'
      ? 'return formatDataOut(input, output.slice(input.length).map(function(value) { return value - 1; }))'
      : 'return output.slice(input.length).map(function(value) { return value - 1; })'
  };
  function Matrix(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.weights = zeros(rows * columns);
  }
  ${
    this.dataFormatter !== null && typeof this.formatDataIn === 'function'
      ? `function formatDataIn(input, output) { ${toInner(
          this.formatDataIn.toString()
        )
          .replace(/this[.]dataFormatter[\n\s]+[.]/g, '')
          .replace(/this[.]dataFormatter[.]/g, '')
          .replace(/this[.]dataFormatter/g, 'true')} }`
      : ''
  }
  ${
    this.dataFormatter !== null && typeof this.formatDataOut === 'function'
      ? `function formatDataOut(input, output) { ${toInner(
          this.formatDataOut.toString()
        )
          .replace(/this[.]dataFormatter[\n\s]+[.]/g, '')
          .replace(/this[.]dataFormatter[.]/g, '')
          .replace(/this[.]dataFormatter/g, 'true')} }`
      : ''
  }
  ${zeros.toString()}
  ${softmax.toString().replace('_2.default', 'Matrix')}
  ${randomFloat.toString()}
  ${sampleI.toString()}
  ${maxI.toString()}`;
    // eslint-disable-next-line
    return new Function(
      'rawInput',
      'maxPredictionLength',
      'isSampleI',
      'temperature',
      src
    );
  }
}

RNN.defaults = {
  inputSize: 20,
  inputRange: 20,
  hiddenSizes: [20, 20],
  outputSize: 20,
  learningRate: 0.01,
  decayRate: 0.999,
  smoothEps: 1e-8,
  regc: 0.000001,
  clipval: 5,
  json: null,
  /**
   *
   * @param {*[]} data
   * @returns {Number[]}
   */
  setupData(data) {
    if (
      typeof data[0] !== 'string' &&
      !Array.isArray(data[0]) &&
      (!data[0].hasOwnProperty('input') || !data[0].hasOwnProperty('output'))
    ) {
      return data;
    }
    const values = [];
    const result = [];
    if (typeof data[0] === 'string' || Array.isArray(data[0])) {
      if (this.dataFormatter === null) {
        for (let i = 0; i < data.length; i++) {
          values.push(data[i]);
        }
        this.dataFormatter = new DataFormatter(values);
      }
      for (let i = 0, max = data.length; i < max; i++) {
        result.push(this.formatDataIn(data[i]));
      }
    } else {
      if (this.dataFormatter === null) {
        for (let i = 0; i < data.length; i++) {
          values.push(data[i].input);
          values.push(data[i].output);
        }
        this.dataFormatter = DataFormatter.fromArrayInputOutput(values);
      }
      for (let i = 0, max = data.length; i < max; i++) {
        result.push(this.formatDataIn(data[i].input, data[i].output));
      }
    }
    return result;
  },
  /**
   *
   * @param {*[]} input
   * @param {*[]} output
   * @returns {Number[]}
   */
  formatDataIn(input, output = null) {
    if (this.dataFormatter !== null) {
      if (this.dataFormatter.indexTable.hasOwnProperty('stop-input')) {
        return this.dataFormatter.toIndexesInputOutput(input, output);
      }
      return this.dataFormatter.toIndexes(input);
    }
    return input;
  },
  /**
   *
   * @param {Number[]} input
   * @param {Number[]} output
   * @returns {*}
   */
  formatDataOut(input, output) {
    if (this.dataFormatter !== null) {
      return this.dataFormatter.toCharacters(output).join('');
    }
    return output;
  },
  dataFormatter: null,
};

RNN.trainDefaults = {
  iterations: 20000,
  errorThresh: 0.005,
  log: false,
  logPeriod: 10,
  learningRate: 0.3,
  callback: null,
  callbackPeriod: 10,
  keepNetworkIntact: false,
};

module.exports = RNN;
