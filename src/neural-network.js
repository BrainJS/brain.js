const Thaw = require('thaw.js').default;
const lookup = require('./lookup');
const TrainStream = require('./train-stream');
const max = require('./utilities/max');
const mse = require('./utilities/mse');
const randos = require('./utilities/randos');
const range = require('./utilities/range');
const toArray = require('./utilities/to-array');
const zeros = require('./utilities/zeros');
const LookupTable = require('./utilities/lookup-table');
const { arrayToFloat32Array } = require('./utilities/cast');

/**
 * @param {object} options
 * @constructor
 */
class NeuralNetwork {
  static get trainDefaults() {
    return {
      iterations: 20000,    // the maximum times to iterate the training data
      errorThresh: 0.005,   // the acceptable error percentage from training data
      log: false,           // true to use console.log, when a function is supplied it is used
      logPeriod: 10,        // iterations between logging out
      learningRate: 0.3,    // multiply's against the input and the delta then adds to momentum
      momentum: 0.1,        // multiply's against the specified "change" then adds to learning rate for change
      callback: null,       // a periodic call back that can be triggered while training
      callbackPeriod: 10,   // the number of iterations through the training data between callback calls
      timeout: Infinity,    // the max number of milliseconds to train for
      praxis: null,
      beta1: 0.9,
      beta2: 0.999,
      epsilon: 1e-8,
    };
  }

  static get defaults() {
    return {
      leakyReluAlpha: 0.01,
      binaryThresh: 0.5,
      hiddenLayers: null,     // array of ints for the sizes of the hidden layers in the network
      activation: 'sigmoid'  // Supported activation types ['sigmoid', 'relu', 'leaky-relu', 'tanh']
    };
  }

  constructor(options = {}) {
    Object.assign(this, this.constructor.defaults, options);
    this.trainOpts = {};
    this.updateTrainingOptions(Object.assign({}, this.constructor.trainDefaults, options));

    this.sizes = null;
    this.outputLayer = null;
    this.biases = null; // weights for bias nodes
    this.weights = null;
    this.outputs = null;

    // state for training
    this.deltas = null;
    this.changes = null; // for momentum
    this.errors = null;
    this.errorCheckInterval = 1;
    if (!this.constructor.prototype.hasOwnProperty('runInput')) {
      this.runInput = null;
    }
    if (!this.constructor.prototype.hasOwnProperty('calculateDeltas')) {
      this.calculateDeltas = null;
    }
    this.inputLookup = null;
    this.inputLookupLength = null;
    this.outputLookup = null;
    this.outputLookupLength = null;

    if (options.inputSize && options.hiddenLayers && options.outputSize) {
      this.sizes = [options.inputSize]
        .concat(options.hiddenLayers)
        .concat([options.outputSize]);
    }
  }

  /**
   *
   * Expects this.sizes to have been set
   */
  initialize() {
    if (!this.sizes) throw new Error ('Sizes must be set before initializing');

    this.outputLayer = this.sizes.length - 1;
    this.biases = []; // weights for bias nodes
    this.weights = [];
    this.outputs = [];

    // state for training
    this.deltas = [];
    this.changes = []; // for momentum
    this.errors = [];

    for (let layer = 0; layer <= this.outputLayer; layer++) {
      let size = this.sizes[layer];
      this.deltas[layer] = zeros(size);
      this.errors[layer] = zeros(size);
      this.outputs[layer] = zeros(size);

      if (layer > 0) {
        this.biases[layer] = randos(size);
        this.weights[layer] = new Array(size);
        this.changes[layer] = new Array(size);

        for (let node = 0; node < size; node++) {
          let prevSize = this.sizes[layer - 1];
          this.weights[layer][node] = randos(prevSize);
          this.changes[layer][node] = zeros(prevSize);
        }
      }
    }

    this.setActivation();
    if (this.trainOpts.praxis === 'adam') {
      this._setupAdam();
    }
  }

  /**
   *
   * @param activation supported inputs: 'sigmoid', 'relu', 'leaky-relu', 'tanh'
   */
  setActivation(activation) {
    this.activation = activation ? activation : this.activation;
    switch (this.activation) {
      case 'sigmoid':
        this.runInput = this.runInput || this._runInputSigmoid;
        this.calculateDeltas = this.calculateDeltas || this._calculateDeltasSigmoid;
        break;
      case 'relu':
        this.runInput = this.runInput || this._runInputRelu;
        this.calculateDeltas = this.calculateDeltas || this._calculateDeltasRelu;
        break;
      case 'leaky-relu':
        this.runInput = this.runInput || this._runInputLeakyRelu;
        this.calculateDeltas = this.calculateDeltas || this._calculateDeltasLeakyRelu;
        break;
      case 'tanh':
        this.runInput = this.runInput || this._runInputTanh;
        this.calculateDeltas = this.calculateDeltas || this._calculateDeltasTanh;
        break;
      default:
        throw new Error('unknown activation ' + this.activation + ', The activation should be one of [\'sigmoid\', \'relu\', \'leaky-relu\', \'tanh\']');
    }
  }

  /**
   *
   * @returns boolean
   */
  get isRunnable(){
    if(!this.runInput){
      console.error('Activation function has not been initialized, did you run train()?');
      return false;
    }

    const checkFns = [
      'sizes',
      'outputLayer',
      'biases',
      'weights',
      'outputs',
      'deltas',
      'changes',
      'errors',
    ].filter(c => this[c] === null);

    if(checkFns.length > 0){
      console.error(`Some settings have not been initialized correctly, did you run train()? Found issues with: ${checkFns.join(', ')}`);
      return false;
    }
    return true;
  }

  /**
   *
   * @param input
   * @returns {*}
   */
  run(input) {
    if (!this.isRunnable) return null;
    if (this.inputLookup) {
      input = lookup.toArray(this.inputLookup, input, this.inputLookupLength);
    }

    let output = this.runInput(input).slice(0);

    if (this.outputLookup) {
      output = lookup.toObject(this.outputLookup, output);
    }
    return output;
  }

  /**
   * trains via sigmoid
   * @param input
   * @returns {*}
   */
  _runInputSigmoid(input) {
    this.outputs[0] = input;  // set output state of input layer

    let output = null;
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      const activeLayer = this.sizes[layer];
      const activeWeights = this.weights[layer];
      const activeBiases = this.biases[layer];
      const activeOutputs = this.outputs[layer];
      for (let node = 0; node < activeLayer; node++) {
        let weights = activeWeights[node];

        let sum = activeBiases[node];
        for (let k = 0; k < weights.length; k++) {
          sum += weights[k] * input[k];
        }
        //sigmoid
        activeOutputs[node] = 1 / (1 + Math.exp(-sum));
      }
      output = input = this.outputs[layer];
    }
    return output;
  }

  _runInputRelu(input) {
    this.outputs[0] = input;  // set output state of input layer

    let output = null;
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      const currentSize = this.sizes[layer];
      const currentWeights = this.weights[layer];
      const currentBiases = this.biases[layer];
      const currentOutputs = this.outputs[layer];
      for (let node = 0; node < currentSize; node++) {
        let weights = currentWeights[node];

        let sum = currentBiases[node];
        for (let k = 0; k < weights.length; k++) {
          sum += weights[k] * input[k];
        }
        //relu
        currentOutputs[node] = (sum < 0 ? 0 : sum);
      }
      output = input = currentOutputs;
    }
    return output;
  }

  _runInputLeakyRelu(input) {
    this.outputs[0] = input;  // set output state of input layer
    let alpha = this.leakyReluAlpha;
    let output = null;
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      const currentSize = this.sizes[layer];
      const currentWeights = this.weights[layer];
      const currentBiases = this.biases[layer];
      const currentOutputs = this.outputs[layer];
      for (let node = 0; node < currentSize; node++) {
        let weights = currentWeights[node];

        let sum = currentBiases[node];
        for (let k = 0; k < weights.length; k++) {
          sum += weights[k] * input[k];
        }
        //leaky relu
        currentOutputs[node] = (sum < 0 ? 0 : alpha * sum);
      }
      output = input = currentOutputs;
    }
    return output;
  }

  _runInputTanh(input) {
    this.outputs[0] = input;  // set output state of input layer

    let output = null;
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      const currentSize = this.sizes[layer];
      const currentWeights = this.weights[layer];
      const currentBiases = this.biases[layer];
      const currentOutputs = this.outputs[layer];
      for (let node = 0; node < currentSize; node++) {
        let weights = currentWeights[node];

        let sum = currentBiases[node];
        for (let k = 0; k < weights.length; k++) {
          sum += weights[k] * input[k];
        }
        //tanh
        currentOutputs[node] = Math.tanh(sum);
      }
      output = input = currentOutputs;
    }
    return output;
  }

  /**
   *
   * @param data
   * Verifies network sizes are initialized
   * If they are not it will initialize them based off the data set.
   */
  verifyIsInitialized(data) {
    if (this.sizes) return;

    this.sizes = [];
    this.sizes.push(data[0].input.length);
    if (!this.hiddenLayers) {
      this.sizes.push(Math.max(3, Math.floor(data[0].input.length / 2)));
    } else {
      this.hiddenLayers.forEach(size => {
        this.sizes.push(size);
      });
    }
    this.sizes.push(data[0].output.length);

    this.initialize();
  }

  /**
   *
   * @param options
   *    Supports all `trainDefaults` properties
   *    also supports:
   *       learningRate: (number),
   *       momentum: (number),
   *       activation: 'sigmoid', 'relu', 'leaky-relu', 'tanh'
   */
  updateTrainingOptions(options) {
    const trainDefaults = this.constructor.trainDefaults;
    for (const p in trainDefaults) {
      if (!trainDefaults.hasOwnProperty(p)) continue;
      this.trainOpts[p] = options.hasOwnProperty(p)
        ? options[p]
        : trainDefaults[p];
    }
    this.validateTrainingOptions(this.trainOpts);
    this.setLogMethod(options.log || this.trainOpts.log);
    this.activation = options.activation || this.activation;
  }

  /**
   *
   * @param options
   */
  validateTrainingOptions(options) {
    const validations = {
      iterations: (val) => { return typeof val === 'number' && val > 0; },
      errorThresh: (val) => { return typeof val === 'number' && val > 0 && val < 1; },
      log: (val) => { return typeof val === 'function' || typeof val === 'boolean'; },
      logPeriod: (val) => { return typeof val === 'number' && val > 0; },
      learningRate: (val) => { return typeof val === 'number' && val > 0 && val < 1; },
      momentum: (val) => { return typeof val === 'number' && val > 0 && val < 1; },
      callback: (val) => { return typeof val === 'function' || val === null },
      callbackPeriod: (val) => { return typeof val === 'number' && val > 0; },
      timeout: (val) => { return typeof val === 'number' && val > 0 }
    };
    for (const p in validations) {
      if (!validations.hasOwnProperty(p)) continue;
      if (!options.hasOwnProperty(p)) continue;
      if (!validations[p](options[p])) {
        throw new Error(`[${p}, ${options[p]}] is out of normal training range, your network will probably not train.`);
      }
    }
  }

  /**
   *
   *  Gets JSON of trainOpts object
   *    NOTE: Activation is stored directly on JSON object and not in the training options
   */
  getTrainOptsJSON() {
    return Object.keys(this.constructor.trainDefaults)
      .reduce((opts, opt) => {
        if (opt === 'timeout' && this.trainOpts[opt] === Infinity) return opts;
        if (opt === 'callback') return opts;
        if (this.trainOpts[opt]) opts[opt] = this.trainOpts[opt];
        if (opt === 'log') opts.log = typeof opts.log === 'function';
        return opts;
      }, {});
  }

  /**
   *
   * @param log
   * if a method is passed in method is used
   * if false passed in nothing is logged
   * @returns error
   */
  setLogMethod(log) {
    if (typeof log === 'function'){
      this.trainOpts.log = log;
    } else if (log) {
      this.trainOpts.log = console.log;
    } else {
      this.trainOpts.log = false;
    }
  }

  /**
   *
   * @param data
   * @returns {Number} error
   */
  calculateTrainingError(data) {
    let sum = 0;
    for (let i = 0; i < data.length; ++i) {
      sum += this.trainPattern(data[i], true);
    }
    return sum / data.length;
  }

  /**
   * @param data
   */
  trainPatterns(data) {
    for (let i = 0; i < data.length; ++i) {
      this.trainPattern(data[i]);
    }
  }

  /**
   *
   * @param {object} data
   * @param {object} status { iterations: number, error: number }
   * @param endTime
   */
  trainingTick(data, status, endTime) {
    const {
      callback,
      callbackPeriod,
      errorThresh,
      iterations,
      log,
      logPeriod,
    } = this.trainOpts;

    if (status.iterations >= iterations || status.error <= errorThresh || Date.now() >= endTime) {
      return false;
    }

    status.iterations++;

    if (log && (status.iterations % logPeriod === 0)) {
      status.error = this.calculateTrainingError(data);
      log(`iterations: ${status.iterations}, training error: ${status.error}`);
    } else {
      if (status.iterations % this.errorCheckInterval === 0) {
        status.error = this.calculateTrainingError(data);
      } else {
        this.trainPatterns(data);
      }
    }

    if (callback && (status.iterations % callbackPeriod === 0)) {
      callback({
        iterations: status.iterations,
        error: status.error
      });
    }
    return true;
  }

  /**
   *
   * @param data
   * @param options
   * @protected
   * @return {object} { data, status, endTime }
   */
  prepTraining(data, options) {
    this.updateTrainingOptions(options);
    data = this.formatData(data);
    const endTime = Date.now() + this.trainOpts.timeout;

    const status = {
      error: 1,
      iterations: 0,
    };

    this.verifyIsInitialized(data);

    return {
      data,
      status,
      endTime,
    };
  }

  /**
   *
   * @param data
   * @param options
   * @returns {object} {error: number, iterations: number}
   */
  train(data, options = {}) {
    let status, endTime;
    ({ data, status, endTime } = this.prepTraining(data, options));

    while (this.trainingTick(data, status, endTime));
    return status;
  }

  /**
   *
   * @param data
   * @param options
   * @returns {Promise}
   * @resolves {{error: number, iterations: number}}
   * @rejects {{trainError: string, status: {error: number, iterations: number}}
   */
  trainAsync(data, options = {}) {
    let status, endTime;
    ({ data, status, endTime } = this.prepTraining(data, options));

    return new Promise((resolve, reject) => {
      try {
        const thawedTrain = new Thaw(new Array(this.trainOpts.iterations), {
          delay: true,
          each: () => this.trainingTick(data, status, endTime) || thawedTrain.stop(),
          done: () => resolve(status)
        });
        thawedTrain.tick();
      } catch (trainError) {
        reject({trainError, status});
      }
    });
  }

  /**
   *
   * @param {object} value
   * @param {boolean} [logErrorRate]
   */
  trainPattern(value, logErrorRate) {
    // forward propagate
    this.runInput(value.input);

    // back propagate
    this.calculateDeltas(value.output);
    this.adjustWeights();

    if  (logErrorRate) {
      return mse(this.errors[this.outputLayer]);
    } else {
      return null;
    }
  }

  /**
   *
   * @param target
   */
  _calculateDeltasSigmoid(target) {
    for (let layer = this.outputLayer; layer >= 0; layer--) {
      const activeSize = this.sizes[layer];
      const activeOutput = this.outputs[layer];
      const activeError = this.errors[layer];
      const activeDeltas = this.deltas[layer];
      const nextLayer = this.weights[layer + 1];

      for (let node = 0; node < activeSize; node++) {
        let output = activeOutput[node];

        let error = 0;
        if (layer === this.outputLayer) {
          error = target[node] - output;
        }
        else {
          let deltas = this.deltas[layer + 1];
          for (let k = 0; k < deltas.length; k++) {
            error += deltas[k] * nextLayer[k][node];
          }
        }
        activeError[node] = error;
        activeDeltas[node] = error * output * (1 - output);
      }
    }
  }

  /**
   *
   * @param target
   */
  _calculateDeltasRelu(target) {
    for (let layer = this.outputLayer; layer >= 0; layer--) {
      const currentSize = this.sizes[layer];
      const currentOutputs = this.outputs[layer];
      const nextWeights = this.weights[layer + 1];
      const nextDeltas = this.deltas[layer + 1];
      const currentErrors = this.errors[layer];
      const currentDeltas = this.deltas[layer];

      for (let node = 0; node < currentSize; node++) {
        let output = currentOutputs[node];

        let error = 0;
        if (layer === this.outputLayer) {
          error = target[node] - output;
        }
        else {
          for (let k = 0; k < nextDeltas.length; k++) {
            error += nextDeltas[k] * nextWeights[k][node];
          }
        }
        currentErrors[node] = error;
        currentDeltas[node] = output > 0 ? error : 0;
      }
    }
  }

  /**
   *
   * @param target
   */
  _calculateDeltasLeakyRelu(target) {
    let alpha = this.leakyReluAlpha;
    for (let layer = this.outputLayer; layer >= 0; layer--) {
      const currentSize = this.sizes[layer];
      const currentOutputs = this.outputs[layer];
      const nextDeltas = this.deltas[layer + 1];
      const nextWeights = this.weights[layer + 1];
      const currentErrors = this.errors[layer];
      const currentDeltas = this.deltas[layer];

      for (let node = 0; node < currentSize; node++) {
        let output = currentOutputs[node];

        let error = 0;
        if (layer === this.outputLayer) {
          error = target[node] - output;
        }
        else {
          for (let k = 0; k < nextDeltas.length; k++) {
            error += nextDeltas[k] * nextWeights[k][node];
          }
        }
        currentErrors[node] = error;
        currentDeltas[node] = output > 0 ? error : alpha * error;
      }
    }
  }

  /**
   *
   * @param target
   */
  _calculateDeltasTanh(target) {
    for (let layer = this.outputLayer; layer >= 0; layer--) {
      const currentSize = this.sizes[layer];
      const currentOutputs = this.outputs[layer];
      const nextDeltas = this.deltas[layer + 1];
      const nextWeights = this.weights[layer + 1];
      const currentErrors = this.errors[layer];
      const currentDeltas = this.deltas[layer];

      for (let node = 0; node < currentSize; node++) {
        let output = currentOutputs[node];

        let error = 0;
        if (layer === this.outputLayer) {
          error = target[node] - output;
        }
        else {
          for (let k = 0; k < nextDeltas.length; k++) {
            error += nextDeltas[k] * nextWeights[k][node];
          }
        }
        currentErrors[node] = error;
        currentDeltas[node] = (1 - output * output) * error;
      }
    }
  }

  /**
   *
   * Changes weights of networks
   */
  adjustWeights() {
    const { learningRate, momentum } = this.trainOpts;
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      let incoming = this.outputs[layer - 1];
      const activeSize = this.sizes[layer];
      const activeDelta = this.deltas[layer];
      const activeChanges = this.changes[layer];
      const activeWeights = this.weights[layer];
      const activeBiases = this.biases[layer];

      for (let node = 0; node < activeSize; node++) {
        let delta = activeDelta[node];

        for (let k = 0; k < incoming.length; k++) {
          let change = activeChanges[node][k];

          change = (learningRate * delta * incoming[k])
            + (momentum * change);

          activeChanges[node][k] = change;
          activeWeights[node][k] += change;
        }
        activeBiases[node] += learningRate * delta;
      }
    }
  }

  _setupAdam() {
    this.biasChangesLow = [];
    this.biasChangesHigh = [];
    this.changesLow = [];
    this.changesHigh = [];
    this.iterations = 0;

    for (let layer = 0; layer <= this.outputLayer; layer++) {
      let size = this.sizes[layer];
      if (layer > 0) {
        this.biasChangesLow[layer] = zeros(size);
        this.biasChangesHigh[layer] = zeros(size);
        this.changesLow[layer] = new Array(size);
        this.changesHigh[layer] = new Array(size);

        for (let node = 0; node < size; node++) {
          let prevSize = this.sizes[layer - 1];
          this.changesLow[layer][node] = zeros(prevSize);
          this.changesHigh[layer][node] = zeros(prevSize);
        }
      }
    }

    this.adjustWeights = this._adjustWeightsAdam;
  }

  _adjustWeightsAdam() {
    this.iterations++;

    const { iterations } = this;
    const {
      beta1,
      beta2,
      epsilon,
      learningRate
    } = this.trainOpts;

    for (let layer = 1; layer <= this.outputLayer; layer++) {
      const incoming = this.outputs[layer - 1];
      const currentSize = this.sizes[layer];
      const currentDeltas = this.deltas[layer];
      const currentChangesLow = this.changesLow[layer];
      const currentChangesHigh = this.changesHigh[layer];
      const currentWeights = this.weights[layer];
      const currentBiases = this.biases[layer];
      const currentBiasChangesLow = this.biasChangesLow[layer];
      const currentBiasChangesHigh = this.biasChangesHigh[layer];

      for (let node = 0; node < currentSize; node++) {
        const delta = currentDeltas[node];

        for (let k = 0; k < incoming.length; k++) {
          const gradient = delta * incoming[k];
          const changeLow = currentChangesLow[node][k] * beta1 + (1 - beta1) * gradient;
          const changeHigh = currentChangesHigh[node][k] * beta2 + (1 - beta2) * gradient * gradient;

          const momentumCorrection = changeLow / (1 - Math.pow(beta1, iterations));
          const gradientCorrection = changeHigh / (1 - Math.pow(beta2, iterations));

          currentChangesLow[node][k] = changeLow;
          currentChangesHigh[node][k] = changeHigh;
          currentWeights[node][k] += learningRate * momentumCorrection / (Math.sqrt(gradientCorrection) + epsilon);
        }

        const biasGradient = currentDeltas[node];
        const biasChangeLow = currentBiasChangesLow[node] * beta1 + (1 - beta1) * biasGradient;
        const biasChangeHigh = currentBiasChangesHigh[node] * beta2 + (1 - beta2) * biasGradient * biasGradient;

        const biasMomentumCorrection = currentBiasChangesLow[node] / (1 - Math.pow(beta1, iterations));
        const biasGradientCorrection = currentBiasChangesHigh[node] / (1 - Math.pow(beta2, iterations));

        currentBiasChangesLow[node] = biasChangeLow;
        currentBiasChangesHigh[node] = biasChangeHigh;
        currentBiases[node] += learningRate * biasMomentumCorrection / (Math.sqrt(biasGradientCorrection) + epsilon);
      }
    }
  }

  /**
   *
   * @param data
   * @returns {*}
   */
  formatData(data) {
    if (!Array.isArray(data)) { // turn stream datum into array
      data = [data];
    }

    if (!Array.isArray(data[0].input)) {
      if (this.inputLookup) {
        this.inputLookupLength = Object.keys(this.inputLookup).length;
      } else {
        const inputLookup = new LookupTable(data, 'input');
        this.inputLookup = inputLookup.table;
        this.inputLookupLength = inputLookup.length;
      }
    }

    if (!Array.isArray(data[0].output)) {
      if (this.outputLookup) {
        this.outputLookupLength = Object.keys(this.outputLookup).length;
      } else {
        const lookup = new LookupTable(data, 'output');
        this.outputLookup = lookup.table;
        this.outputLookupLength = lookup.length;
      }
    }

    if (typeof this._formatInput === 'undefined') {
      this._formatInput = getTypedArrayFn(data[0].input, this.inputLookup);
      this._formatOutput = getTypedArrayFn(data[0].output, this.outputLookup);
    }

    // turn sparse hash input into arrays with 0s as filler
    if (this._formatInput && this._formatOutput) {
      const result = [];
      for (let i = 0; i < data.length; i++) {
        result.push({
          input: this._formatInput(data[i].input),
          output: this._formatOutput(data[i].output),
        });
      }
      return result;
    } else if (this._formatInput) {
      const result = [];
      for (let i = 0; i < data.length; i++) {
        result.push({
          input: this._formatInput(data[i].input),
          output: data[i].output
        });
      }
      return result;
    } else if (this._formatOutput) {
      const result = [];
      for (let i = 0; i < data.length; i++) {
        result.push({
          input: data[i].input,
          output: this._formatOutput(data[i].output)
        });
      }
      return result;
    }
    return data;
  }

  addFormat(data) {
    this.inputLookup = lookup.addKeys(data.input, this.inputLookup);
    if (this.inputLookup) {
      this.inputLookupLength = Object.keys(this.inputLookup).length;
    }
    this.outputLookup = lookup.addKeys(data.output, this.outputLookup);
    if (this.outputLookup) {
      this.outputLookupLength = Object.keys(this.outputLookup).length;
    }
  }

  /**
   *
   * @param data
   * @returns {
   *  {
   *    error: number,
   *    misclasses: Array,
   *  }
   * }
   */
  test(data) {
    data = this.formatData(data);
    // for binary classification problems with one output node
    const isBinary = data[0].output.length === 1;
    // for classification problems
    const misclasses = [];
    // run each pattern through the trained network and collect
    // error and misclassification statistics
    let errorSum = 0;

    if (isBinary) {
      let falsePos = 0;
      let falseNeg = 0;
      let truePos = 0;
      let trueNeg = 0;

      for (let i = 0; i < data.length; i++) {
        const output = this.runInput(data[i].input);
        const target = data[i].output;
        const actual = output[0] > this.binaryThresh ? 1 : 0;
        const expected = target[0];

        if (actual !== expected) {
          const misclass = data[i];
          misclasses.push({
            input: misclass.input,
            output: misclass.output,
            actual,
            expected
          });
        }

        if (actual === 0 && expected === 0) {
          trueNeg++;
        } else if (actual === 1 && expected === 1) {
          truePos++;
        } else if (actual === 0 && expected === 1) {
          falseNeg++;
        } else if (actual === 1 && expected === 0) {
          falsePos++;
        }

        errorSum += mse(output.map((value, i) => {
          return target[i] - value;
        }));
      }

      return {
        error: errorSum / data.length,
        misclasses: misclasses,
        total: data.length,
        trueNeg: trueNeg,
        truePos: truePos,
        falseNeg: falseNeg,
        falsePos: falsePos,
        precision: truePos > 0 ? truePos / (truePos + falsePos) : 0,
        recall: truePos > 0 ? truePos / (truePos + falseNeg) : 0,
        accuracy: (trueNeg + truePos) / data.length
      };
    }

    for (let i = 0; i < data.length; i++) {
      const output = this.runInput(data[i].input);
      const target = data[i].output;
      const actual = output.indexOf(max(output));
      const expected = target.indexOf(max(target));

      if (actual !== expected) {
        const misclass = data[i];
        misclasses.push({
          input: misclass.input,
          output: misclass.output,
          actual,
          expected
        });
      }

      errorSum += mse(output.map((value, i) => {
        return target[i] - value;
      }));
    }
    return {
      error: errorSum / data.length,
      misclasses: misclasses,
      total: data.length
    };
  }

  /**
   *
   * @returns
   *  {
   *    layers: [
   *      {
   *        x: {},
   *        y: {}
   *      },
   *      {
   *        '0': {
   *          bias: -0.98771313,
   *          weights: {
   *            x: 0.8374838,
   *            y: 1.245858
   *          },
   *        '1': {
   *          bias: 3.48192004,
   *          weights: {
   *            x: 1.7825821,
   *            y: -2.67899
   *          }
   *        }
   *      },
   *      {
   *        f: {
   *          bias: 0.27205739,
   *          weights: {
   *            '0': 1.3161821,
   *            '1': 2.00436
   *          }
   *        }
   *      }
   *    ]
   *  }
   */
  toJSON() {
    if (this.sizes === null) {
      this.initialize();
    }
    const layers = [];
    for (let layer = 0; layer <= this.outputLayer; layer++) {
      layers[layer] = {};

      let nodes;
      // turn any internal arrays back into hashes for readable json
      if (layer === 0 && this.inputLookup) {
        nodes = Object.keys(this.inputLookup);
      } else if (this.outputLookup && layer === this.outputLayer) {
        nodes = Object.keys(this.outputLookup);
      } else {
        nodes = range(0, this.sizes[layer]);
      }

      for (let j = 0; j < nodes.length; j++) {
        const node = nodes[j];
        layers[layer][node] = {};

        if (layer > 0) {
          layers[layer][node].bias = this.biases[layer][j];
          layers[layer][node].weights = {};
          for (let k in layers[layer - 1]) {
            let index = k;
            if (layer === 1 && this.inputLookup) {
              index = this.inputLookup[k];
            }
            layers[layer][node].weights[k] = this.weights[layer][j][index];
          }
        }
      }
    }
    return {
      sizes: this.sizes.slice(0),
      layers,
      outputLookup: this.outputLookup !== null,
      inputLookup: this.inputLookup !== null,
      activation: this.activation,
      trainOpts: this.getTrainOptsJSON()
    };
  }

  /**
   *
   * @param json
   * @returns {NeuralNetwork}
   */
  fromJSON(json) {
    Object.assign(this, this.constructor.defaults, json);
    this.sizes = json.sizes;
    this.initialize();

    for (let i = 0; i <= this.outputLayer; i++) {
      let layer = json.layers[i];
      if (i === 0 && (!layer[0] || json.inputLookup)) {
        this.inputLookup = lookup.toHash(layer);
        this.inputLookupLength = Object.keys(this.inputLookup).length;
      }
      else if (i === this.outputLayer && (!layer[0] || json.outputLookup)) {
        this.outputLookup = lookup.toHash(layer);
      }
      if (i > 0) {
        const nodes = Object.keys(layer);
        this.sizes[i] = nodes.length;
        for (let j in nodes) {
          if (nodes.hasOwnProperty(j)) {
            const node = nodes[j];
            this.biases[i][j] = layer[node].bias;
            this.weights[i][j] = toArray(layer[node].weights);
          }
        }
      }
    }
    if (json.hasOwnProperty('trainOpts')) {
      this.updateTrainingOptions(json.trainOpts);
    }
    return this;
  }

  /**
   *
   * @returns {Function}
   */
  toFunction() {
    const activation = this.activation;
    const leakyReluAlpha = this.leakyReluAlpha;
    let needsVar = false;
    function nodeHandle(layers, layerNumber, nodeKey) {
      if (layerNumber === 0) {
        return typeof nodeKey === 'string'
          ? `(input['${nodeKey}']||0)`
          : `(input[${nodeKey}]||0)`;
      }

      const layer = layers[layerNumber];
      const node = layer[nodeKey];
      let result = ['(' , node.bias];
      for (let w in node.weights) {
        if (node.weights[w] < 0) {
          result.push(`${node.weights[w]}*${nodeHandle(layers, layerNumber - 1, w)}`);
        } else {
          result.push(`+${node.weights[w]}*${nodeHandle(layers, layerNumber - 1, w)}`);
        }
      }
      result.push(')');

      switch (activation) {
        case 'sigmoid':
          return `1/(1+1/Math.exp(${result.join('')}))`;
        case 'relu': {
          needsVar = true;
          return `((v=${result.join('')})<0?0:v)`;
        }
        case 'leaky-relu': {
          needsVar = true;
          return `((v=${result.join('')})<0?0:${leakyReluAlpha}*v)`;
        }
        case 'tanh':
          return `Math.tanh(${result.join('')})`;
        default:
          throw new Error(`unknown activation type ${activation}`);
      }
    }

    const layers = this.toJSON().layers;
    const layersAsMath = [];
    let result;
    for (let i in layers[layers.length - 1]) {
      layersAsMath.push(nodeHandle(layers, layers.length - 1, i));
    }
    if (this.outputLookup) {
      result = `{${
        Object.keys(this.outputLookup)
          .map((key, i) => `'${key}':${layersAsMath[i]}`)
        }}`;
    } else {
      result = `[${layersAsMath.join(',')}]`;
    }

    return new Function('input', `${ needsVar ? 'var v;' : '' }return ${result};`);
  }
}


function getTypedArrayFn(value, table) {
  if (value.buffer instanceof ArrayBuffer) {
    return null;
  } else if (Array.isArray(value)) {
    return arrayToFloat32Array;
  } else {
    const length = Object.keys(table).length;
    return (v) => {
      const array = new Float32Array(length);
      for (let p in table) {
        array[table[p]] = v[p] || 0;
      }
      return array;
    }
  }
}


module.exports = NeuralNetwork;
