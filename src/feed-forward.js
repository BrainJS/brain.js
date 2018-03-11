import lookup from './lookup';
import TrainStream from './train-stream';
import mse2d from './utilities/mse-2d';
import layerFromJSON from './utilities/layer-from-json';
import * as praxis from './praxis';
import flattenLayers from './utilities/flatten-layers';

export default class FeedForward {
  static get trainDefaults() {
    return {
      iterations: 20000,
      errorThresh: 0.005,
      log: false,
      logPeriod: 10,
      learningRate: 0.3,
      callback: null,
      callbackPeriod: 10,
      reinforce: false
    };
  }

  static get defaults() {
    return {
      learningRate: 0.3,
      momentum: 0.1,
      binaryThresh: 0.5,
      hiddenLayers: null,
      inputLayer: null,
      outputLayer: null,
      praxis: (layer) => praxis.momentumRootMeanSquaredPropagation(layer)
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
    Object.keys(FeedForward.trainDefaults).forEach(key => {
      if (validations.hasOwnProperty(key) && !validations[key](options[key])) {
        throw new Error(`[${key}, ${options[key]}] is out of normal training range, your network will probably not train.`);
      }
    });
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
   * @param opts
   *    Supports all `trainDefaults` properties
   *    also supports:
   *       learningRate: (number),
   *       momentum: (number),
   *       activation: 'sigmoid', 'relu', 'leaky-relu', 'tanh'
   */
  _updateTrainingOptions(opts) {
    Object.keys(this.constructor.trainDefaults).forEach(opt => this.trainOpts[opt] = (opts.hasOwnProperty(opt)) ? opts[opt] : this.trainOpts[opt]);
    this.constructor._validateTrainingOptions(this.trainOpts);
    this._setLogMethod(opts.log || this.trainOpts.log);
    this.activation = opts.activation || this.activation;
  }

  /**
   *
   * @param {object} options
   * @constructor
   */
  constructor(options = {}) {
    this.inputLayer = null;
    this.hiddenLayers = null;
    this.outputLayer = null;
    this.errorCheckInterval = 100;
    Object.assign(this, this.constructor.defaults, options);
    this.trainOpts = {};
    this._updateTrainingOptions(Object.assign({}, this.constructor.trainDefaults, options));
    this.layers = null;
    this._inputLayer = null;
    this._outputLayer = null;
  }

  _connectLayers() {
    this.layers = [];
    const inputLayer = this.inputLayer(null, this.layers.length);
    this._inputLayer = inputLayer;
    this.layers.push(inputLayer);
    this.connectHiddenLayers();
    this._outputLayer = this.outputLayer(this.layers[this.layers.length - 1], this.layers.length);
    this.layers.push(this._outputLayer);
  }

  connectHiddenLayers() {
    for (let i = 0; i < this.hiddenLayers.length; i++) {
      const previousLayer = this.layers[this.layers.length - 1];
      const hiddenLayer = this.hiddenLayers[i](previousLayer, this.layers.length);
      this.layers.push(hiddenLayer);
    }
  }

  initialize() {
    this._connectLayers();
    flattenLayers(this.layers);
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      layer.validate();
      layer.setupKernels();
      if (layer.hasOwnProperty('praxis') && layer.praxis === null) {
        layer.praxis = this.praxis(layer);
      }
    }
  }
  /**
   *
   * @param input
   * @returns {*}
   */
  run(input) {
    if (this.inputLookup) {
      input = lookup.toArray(this.inputLookup, input);
    }

    let output = this.runInput(input);

    if (this.outputLookup) {
      output = lookup.toHash(this.outputLookup, output);
    }
    return output;
  }

  runInput(input) {
    this.layers[0].predict(input);
    for (let i = 1; i < this.layers.length; i++) {
      this.layers[i].predict();
    }
    return this.layers[this.layers.length - 1].weights;
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

    this.initialize();

    return {
      data,
      status,
      endTime
    };
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
   * @param input
   * @param target
   */
  _trainPattern(input, target, logErrorRate) {

    // forward propagate
    this.runInput(input);

    // back propagate
    this._calculateDeltas(target);
    this._adjustWeights();

    if (logErrorRate) {
      return mse2d(this._outputLayer.errors.hasOwnProperty('toArray') ? this._outputLayer.errors.toArray() : this._outputLayer.errors);
    } else {
      return null
    }
  }

  _calculateDeltas(target) {
    this._outputLayer.compare(target);
    for (let i = this.layers.length - 2; i > -1; i--) {
      const previousLayer = this.layers[i - 1];
      const nextLayer = this.layers[i + 1];
      this.layers[i].compare(previousLayer, nextLayer);
    }
  }

  /**
   *
   */
  _adjustWeights() {
    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i].learn(this.layers[i-1], this.layers[i+1], this.trainOpts.learningRate);
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
    /* istanbul ignore next */
    throw new Error('not yet implemented');
  }

  /**
   *
   */
  toJSON() {
    const jsonLayers = [];
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const jsonLayer = layer.toJSON();
      if (layer.hasOwnProperty('inputLayer')) {
        jsonLayer.inputLayerIndex = this.layers.indexOf(layer.inputLayer);
      } else {
        if (layer.hasOwnProperty('inputLayer1') && layer.hasOwnProperty('inputLayer2')) {
          jsonLayer.inputLayer1Index = this.layers.indexOf(layer.inputLayer1);
          jsonLayer.inputLayer2Index = this.layers.indexOf(layer.inputLayer2);
        }
      }
      jsonLayers.push(jsonLayer);
    }
    return  {
      layers: jsonLayers
    };
  }

  /**
   *
   * @param json
   * @param [getLayer]
   * @returns {FeedForward}
   */
  static fromJSON(json, getLayer) {
    const jsonLayers = json.layers;
    const layers = [];
    const inputLayer = layerFromJSON(jsonLayers[0]) || getLayer(jsonLayers[0]);
    layers.push(inputLayer);
    for (let i = 1; i < jsonLayers.length; i++) {
      const jsonLayer = jsonLayers[i];
      if (jsonLayer.hasOwnProperty('inputLayerIndex')) {
        const inputLayer = layers[jsonLayer.inputLayerIndex];
        layers.push(layerFromJSON(jsonLayer, inputLayer) || getLayer(jsonLayer, inputLayer));
      } else {
        if (!jsonLayer.hasOwnProperty('inputLayer1Index')) throw new Error('inputLayer1Index not defined');
        if (!jsonLayer.hasOwnProperty('inputLayer2Index')) throw new Error('inputLayer2Index not defined');
        const inputLayer1 = layers[jsonLayer.inputLayer1Index];
        const inputLayer2 = layers[jsonLayer.inputLayer2Index];

        if (inputLayer1 === undefined) throw new Error(`layer of index ${jsonLayer.inputLayer1Index} not found`);
        if (inputLayer2 === undefined) throw new Error(`layer of index ${jsonLayer.inputLayer2Index} not found`);

        layers.push(layerFromJSON(jsonLayer, inputLayer) || getLayer(jsonLayer, inputLayer1, inputLayer2));
      }
    }

    const net = new FeedForward(json);
    net.layers = layers;
    return net;
  }

  /**
   *
   * @returns {Function}
   */
  toFunction() {
    /* istanbul ignore next */
    throw new Error('not yet implemented');
  }

  /**
   * This will create a TrainStream (WriteStream) for us to send the training data to.
   * @param opts training options
   * @returns {TrainStream|*}
   */
  createTrainStream(opts) {
    /* istanbul ignore next */
    throw new Error('not yet implemented');
  }
}