import lookup from './lookup';
import TrainStream from './train-stream';
import max from './utilities/max';
import mse from './utilities/mse';
import randos from './utilities/randos';
import range from './utilities/range';
import toArray from './utilities/to-array';
import zeros from './utilities/zeros';
import Thaw from 'thaw.js';

/**
 * @param {object} options
 * @constructor
 */
export default class NeuralNetwork {
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
      timeout: Infinity     // the max number of milliseconds to train for
    };
  }

  static get defaults() {
    return {
      binaryThresh: 0.5,     // ¯\_(ツ)_/¯
      hiddenLayers: [3],     // array of ints for the sizes of the hidden layers in the network
      activation: 'sigmoid'  // Supported activation types ['sigmoid', 'relu', 'leaky-relu', 'tanh']
    };
  }

  /**
   *
   * @param options
   * @private
   */
  static _validateTrainingOptions(options) {
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
    Object.keys(NeuralNetwork.trainDefaults).forEach(key => {
      if (validations.hasOwnProperty(key) && !validations[key](options[key])) {
        throw new Error(`[${key}, ${options[key]}] is out of normal training range, your network will probably not train.`);
      }
    });
  }

  constructor(options = {}) {
    Object.assign(this, this.constructor.defaults, options);
    this.hiddenSizes = options.hiddenLayers;
    this.trainOpts = {};
    this._updateTrainingOptions(Object.assign({}, this.constructor.trainDefaults, options));

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
  }

  /**
   *
   * Expects this.sizes to have been set
   */
  _initialize() {
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
  }

  /**
   *
   * @param activation supported inputs: 'sigmoid', 'relu', 'leaky-relu', 'tanh'
   */
  setActivation(activation) {
    this.activation = (activation) ? activation : this.activation;
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
      input = lookup.toArray(this.inputLookup, input);
    }

    let output = [...this.runInput(input)];

    if (this.outputLookup) {
      output = lookup.toHash(this.outputLookup, output);
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
      for (let node = 0; node < this.sizes[layer]; node++) {
        let weights = this.weights[layer][node];

        let sum = this.biases[layer][node];
        for (let k = 0; k < weights.length; k++) {
          sum += weights[k] * input[k];
        }
        //sigmoid
        this.outputs[layer][node] = 1 / (1 + Math.exp(-sum));
      }
      output = input = this.outputs[layer];
    }
    return output;
  }

  _runInputRelu(input) {
    this.outputs[0] = input;  // set output state of input layer

    let output = null;
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      for (let node = 0; node < this.sizes[layer]; node++) {
        let weights = this.weights[layer][node];

        let sum = this.biases[layer][node];
        for (let k = 0; k < weights.length; k++) {
          sum += weights[k] * input[k];
        }
        //relu
        this.outputs[layer][node] = (sum < 0 ? 0 : sum);
      }
      output = input = this.outputs[layer];
    }
    return output;
  }

  _runInputLeakyRelu(input) {
    this.outputs[0] = input;  // set output state of input layer

    let output = null;
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      for (let node = 0; node < this.sizes[layer]; node++) {
        let weights = this.weights[layer][node];

        let sum = this.biases[layer][node];
        for (let k = 0; k < weights.length; k++) {
          sum += weights[k] * input[k];
        }
        //leaky relu
        this.outputs[layer][node] = (sum < 0 ? 0 : 0.01 * sum);
      }
      output = input = this.outputs[layer];
    }
    return output;
  }

  _runInputTanh(input) {
    this.outputs[0] = input;  // set output state of input layer

    let output = null;
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      for (let node = 0; node < this.sizes[layer]; node++) {
        let weights = this.weights[layer][node];

        let sum = this.biases[layer][node];
        for (let k = 0; k < weights.length; k++) {
          sum += weights[k] * input[k];
        }
        //tanh
        this.outputs[layer][node] = Math.tanh(sum);
      }
      output = input = this.outputs[layer];
    }
    return output;
  }

  /**
   *
   * @param data
   * Verifies network sizes are initilaized
   * If they are not it will initialize them based off the data set.
   */
  _verifyIsInitialized(data) {
    if (this.sizes) return;

    this.sizes = [];
    this.sizes.push(data[0].input.length);
    if (!this.hiddenSizes) {
      this.sizes.push(Math.max(3, Math.floor(data[0].input.length / 2)));
    } else {
      this.hiddenSizes.forEach(size => {
        this.sizes.push(size);
      });
    }
    this.sizes.push(data[0].output.length);

    this._initialize();
  }

  /**
   *
   * @param opts
   *    Supports all `trainDefaults` properties
   *    also supports:
   *       learningRate: (number),
   *       momentum: (number),
   *       activation: 'sigmoid', 'relu', 'leaky-relu', 'tanh'
   */
  _updateTrainingOptions(opts) {
    Object.keys(NeuralNetwork.trainDefaults).forEach(opt => this.trainOpts[opt] = (opts.hasOwnProperty(opt)) ? opts[opt] : this.trainOpts[opt]);
    NeuralNetwork._validateTrainingOptions(this.trainOpts);
    this._setLogMethod(opts.log || this.trainOpts.log);
    this.activation = opts.activation || this.activation;
  }

  /**
   *
   *  Gets JSON of trainOpts object
   *    NOTE: Activation is stored directly on JSON object and not in the training options
   */
  _getTrainOptsJSON() {
    return Object.keys(NeuralNetwork.trainDefaults)
      .reduce((opts, opt) => {
        if (opt === 'timeout' && this.trainOpts[opt] === Infinity) return opts;
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
  _setLogMethod(log) {
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
  _calculateTrainingError(data) {
    let sum = 0;
    for (let i = 0; i < data.length; ++i) {
      sum += this._trainPattern(data[i].input, data[i].output, true);
    }
    return sum / data.length;
  }

  /**
   * @param data
   * @private
   */
  _trainPatterns(data) {
    for (let i = 0; i < data.length; ++i) {
      this._trainPattern(data[i].input, data[i].output, false);
    }
  }

  /**
   *
   * @param {object} data
   * @param {object} status { iterations: number, error: number }
   * @param endTime
   */
  _trainingTick(data, status, endTime) {
    if (status.iterations >= this.trainOpts.iterations || status.error <= this.trainOpts.errorThresh || Date.now() >= endTime) {
      return false;
    }

    status.iterations++;

    if (this.trainOpts.log && (status.iterations % this.trainOpts.logPeriod === 0)) {
      status.error = this._calculateTrainingError(data);
      this.trainOpts.log(`iterations: ${status.iterations}, training error: ${status.error}`);
    } else {
      if (status.iterations % this.errorCheckInterval === 0) {
        status.error = this._calculateTrainingError(data);
      } else {
        this._trainPatterns(data);
      }
    }

    if (this.trainOpts.callback && (status.iterations % this.trainOpts.callbackPeriod === 0)) {
      this.trainOpts.callback(Object.assign(status));
    }
    return true;
  }

  /**
   *
   * @param data
   * @param options
   * @protected
   * @return { data, status, endTime }
   */
  _prepTraining(data, options) {
    this._updateTrainingOptions(options);
    data = this._formatData(data);
    const endTime = Date.now() + this.trainOpts.timeout;

    const status = {
      error: 1,
      iterations: 0
    };

    this._verifyIsInitialized(data);

    return {
      data,
      status,
      endTime
    };
  }

  /**
   *
   * @param data
   * @param options
   * @returns {{error: number, iterations: number}}
   */
  train(data, options = {}) {
    let status, endTime;
    ({ data, status, endTime } = this._prepTraining(data, options));

    while (this._trainingTick(data, status, endTime));
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
    ({ data, status, endTime } = this._prepTraining(data, options));

    return new Promise((resolve, reject) => {
      try {
        const thawedTrain = new Thaw(new Array(this.trainOpts.iterations), {
          delay: true,
          each: () => this._trainingTick(data, status, endTime) || thawedTrain.stop(),
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
   * @param input
   * @param target
   */
  _trainPattern(input, target, logErrorRate) {

    // forward propagate
    this.runInput(input);

    // back propagate
    this.calculateDeltas(target);
    this._adjustWeights();

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
      for (let node = 0; node < this.sizes[layer]; node++) {
        let output = this.outputs[layer][node];

        let error = 0;
        if (layer === this.outputLayer) {
          error = target[node] - output;
        }
        else {
          let deltas = this.deltas[layer + 1];
          for (let k = 0; k < deltas.length; k++) {
            error += deltas[k] * this.weights[layer + 1][k][node];
          }
        }
        this.errors[layer][node] = error;
        this.deltas[layer][node] = error * output * (1 - output);
      }
    }
  }

  /**
   *
   * @param target
   */
  _calculateDeltasRelu(target) {
    for (let layer = this.outputLayer; layer >= 0; layer--) {
      for (let node = 0; node < this.sizes[layer]; node++) {
        let output = this.outputs[layer][node];

        let error = 0;
        if (layer === this.outputLayer) {
          error = target[node] - output;
        }
        else {
          let deltas = this.deltas[layer + 1];
          for (let k = 0; k < deltas.length; k++) {
            error += deltas[k] * this.weights[layer + 1][k][node];
          }
        }
        this.errors[layer][node] = error;
        this.deltas[layer][node] = output > 0 ? error : 0;
      }
    }
  }

  /**
   *
   * @param target
   */
  _calculateDeltasLeakyRelu(target) {
    for (let layer = this.outputLayer; layer >= 0; layer--) {
      for (let node = 0; node < this.sizes[layer]; node++) {
        let output = this.outputs[layer][node];

        let error = 0;
        if (layer === this.outputLayer) {
          error = target[node] - output;
        }
        else {
          let deltas = this.deltas[layer + 1];
          for (let k = 0; k < deltas.length; k++) {
            error += deltas[k] * this.weights[layer + 1][k][node];
          }
        }
        this.errors[layer][node] = error;
        this.deltas[layer][node] = output > 0 ? error : 0.01 * error;
      }
    }
  }

  /**
   *
   * @param target
   */
  _calculateDeltasTanh(target) {
    for (let layer = this.outputLayer; layer >= 0; layer--) {
      for (let node = 0; node < this.sizes[layer]; node++) {
        let output = this.outputs[layer][node];

        let error = 0;
        if (layer === this.outputLayer) {
          error = target[node] - output;
        }
        else {
          let deltas = this.deltas[layer + 1];
          for (let k = 0; k < deltas.length; k++) {
            error += deltas[k] * this.weights[layer + 1][k][node];
          }
        }
        this.errors[layer][node] = error;
        this.deltas[layer][node] = (1 - output * output) * error;
      }
    }
  }

  /**
   *
   * Changes weights of networks
   */
  _adjustWeights() {
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      let incoming = this.outputs[layer - 1];

      for (let node = 0; node < this.sizes[layer]; node++) {
        let delta = this.deltas[layer][node];

        for (let k = 0; k < incoming.length; k++) {
          let change = this.changes[layer][node][k];

          change = (this.trainOpts.learningRate * delta * incoming[k])
            + (this.trainOpts.momentum * change);

          this.changes[layer][node][k] = change;
          this.weights[layer][node][k] += change;
        }
        this.biases[layer][node] += this.trainOpts.learningRate * delta;
      }
    }
  }

  /**
   *
   * @param data
   * @returns {*}
   */
  _formatData(data) {
    if (!Array.isArray(data)) { // turn stream datum into array
      let tmp = [];
      tmp.push(data);
      data = tmp;
    }
    // turn sparse hash input into arrays with 0s as filler
    let datum = data[0].input;
    if (!Array.isArray(datum) && !(datum instanceof Float32Array)) {
      if (!this.inputLookup) {
        this.inputLookup = lookup.buildLookup(data.map(value => value['input']));
      }
      data = data.map(datum => {
        let array = lookup.toArray(this.inputLookup, datum.input);
        return Object.assign({}, datum, { input: array });
      }, this);
    }

    if (!Array.isArray(data[0].output)) {
      if (!this.outputLookup) {
        this.outputLookup = lookup.buildLookup(data.map(value => value['output']));
      }
      data = data.map(datum => {
        let array = lookup.toArray(this.outputLookup, datum.output);
        return Object.assign({}, datum, { output: array });
      }, this);
    }
    return data;
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
    data = this._formatData(data);

    // for binary classification problems with one output node
    let isBinary = data[0].output.length === 1;
    let falsePos = 0;
    let falseNeg = 0;
    let truePos = 0;
    let trueNeg = 0;

    // for classification problems
    let misclasses = [];

    // run each pattern through the trained network and collect
    // error and misclassification statistics
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      let output = this.runInput(data[i].input);
      let target = data[i].output;

      let actual, expected;
      if (isBinary) {
        actual = output[0] > this.binaryThresh ? 1 : 0;
        expected = target[0];
      }
      else {
        actual = output.indexOf(max(output));
        expected = target.indexOf(max(target));
      }

      if (actual !== expected) {
        let misclass = data[i];
        Object.assign(misclass, {
          actual: actual,
          expected: expected
        });
        misclasses.push(misclass);
      }

      if (isBinary) {
        if (actual === 0 && expected === 0) {
          trueNeg++;
        } else if (actual === 1 && expected === 1) {
          truePos++;
        } else if (actual === 0 && expected === 1) {
          falseNeg++;
        } else if (actual === 1 && expected === 0) {
          falsePos++;
        }
      }

      let errors = output.map((value, i) => {
        return target[i] - value;
      });
      sum += mse(errors);
    }
    let error = sum / data.length;

    let stats = {
      error: error,
      misclasses: misclasses
    };

    if (isBinary) {
      Object.assign(stats, {
        trueNeg: trueNeg,
        truePos: truePos,
        falseNeg: falseNeg,
        falsePos: falsePos,
        total: data.length,
        precision: truePos / (truePos + falsePos),
        recall: truePos / (truePos + falseNeg),
        accuracy: (trueNeg + truePos) / data.length
      });
    }
    return stats;
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
    let layers = [];
    for (let layer = 0; layer <= this.outputLayer; layer++) {
      layers[layer] = {};

      let nodes;
      // turn any internal arrays back into hashes for readable json
      if (layer === 0 && this.inputLookup) {
        nodes = Object.keys(this.inputLookup);
      }
      else if (layer === this.outputLayer && this.outputLookup) {
        nodes = Object.keys(this.outputLookup);
      }
      else {
        nodes = range(0, this.sizes[layer]);
      }

      for (let j = 0; j < nodes.length; j++) {
        let node = nodes[j];
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
      sizes: this.sizes,
      layers,
      outputLookup:!!this.outputLookup,
      inputLookup:!!this.inputLookup,
      activation: this.activation,
      trainOpts: this._getTrainOptsJSON()
    };
  }

  /**
   *
   * @param json
   * @returns {NeuralNetwork}
   */
  fromJSON(json) {
    this.sizes = json.sizes;
    this._initialize();

    for (let i = 0; i <= this.outputLayer; i++) {
      let layer = json.layers[i];
      if (i === 0 && (!layer[0] || json.inputLookup)) {
        this.inputLookup = lookup.lookupFromHash(layer);
      }
      else if (i === this.outputLayer && (!layer[0] || json.outputLookup)) {
        this.outputLookup = lookup.lookupFromHash(layer);
      }
      if (i > 0) {
        const nodes = Object.keys(layer);
        this.sizes[i] = nodes.length;
        for (let j in nodes) {
          const node = nodes[j];
          this.biases[i][j] = layer[node].bias;
          this.weights[i][j] = toArray(layer[node].weights);
        }
      }
    }
    if (json.hasOwnProperty('trainOpts')) {
      this._updateTrainingOptions(json.trainOpts);
    }
    this.setActivation(this.activation || 'sigmoid');
    return this;
  }

  /**
   *
   * @returns {Function}
   */
  toFunction() {
    const activation = this.activation;
    function nodeHandle(layers, layerNumber, nodeKey) {
      if (layerNumber === 0) {
        return (typeof nodeKey === 'string'
          ? `input['${nodeKey}']`
          : `input[${nodeKey}]`);
      }

      const layer = layers[layerNumber];
      const node = layer[nodeKey];
      let result = [node.bias];
      for (let w in node.weights) {
        if (node.weights[w] < 0) {
          result.push(`${node.weights[w]}*(${nodeHandle(layers, layerNumber - 1, w)})`);
        } else {
          result.push(`+${node.weights[w]}*(${nodeHandle(layers, layerNumber - 1, w)})`);
        }
      }

      switch (activation) {
        case 'sigmoid':
          return `1/(1+1/Math.exp(${result.join('')}))`;
        case 'relu':
          return `(${result.join('')} < 0 ? 0 : ${result.join('')})`;
        case 'leaky-relu':
          return `(${result.join('')} < 0 ? 0 : 0.01 * ${result.join('')})`;
        case 'tanh':
          return `Math.tanh(${result.join('')})`;
        default:
          throw new Error('unknown activation type ' + activation);
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
    return new Function('input', `return ${result}`);
  }

  /**
   * This will create a TrainStream (WriteStream) for us to send the training data to.
   * @param opts training options
   * @returns {TrainStream|*}
   */
  createTrainStream(opts) {
    opts = opts || {};
    opts.neuralNetwork = this;
    this.setActivation();
    this.trainStream = new TrainStream(opts);
    return this.trainStream;
  }
}