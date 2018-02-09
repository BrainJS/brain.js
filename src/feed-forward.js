import lookup from './lookup';
import TrainStream from './train-stream';
import max from './utilities/max';
import mse2d from './utilities/mse-2d';
import layerFromJSON from './utilities/layer-from-json';
import traverseLayersFrom from './utilities/traverse-layers-from';
import * as praxis from './praxis';

/**
 *
 * @param {object} options
 * @constructor
 */
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

  constructor(options = {}) {
    Object.assign(this, this.constructor.defaults, options);
    this.layers = null;
    this._inputLayer = null;
    this._outputLayer = null;
    this._lastHiddenLayer = null;
    this._inputLayerStartingIndex = null;
    this._inputLayerEndingIndex = null;
    this._hiddenLayerStartingIndex = null;
    this._hiddenLayerEndingIndex = null;
    this._outputLayerStartingIndex = null;
    this._outputLayerEndingIndex = null;
  }

  connectLayers() {
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
      this._lastHiddenLayer = hiddenLayer;
      this.layers.push(hiddenLayer);
    }
  }

  flattenLayers() {
    for (let i = 0; i < this.layers.length; i++) {
      let offset = 0;
      traverseLayersFrom(this.layers[i], (layer) => {
        if (this.layers.indexOf(layer) === -1) {
          this.layers.splice(i + offset, 0, layer);
          offset++;
        }
      });
    }
  }

  indexLayers() {
    this._inputLayerStartingIndex = 0;
    this._inputLayerEndingIndex = this.layers.indexOf(this._inputLayer);
    this._hiddenLayerStartingIndex = this._inputLayerEndingIndex + 1;
    this._hiddenLayerEndingIndex = this.layers.indexOf(this._lastHiddenLayer);
    this._outputLayerStartingIndex = this._hiddenLayerEndingIndex + 1;
    this._outputLayerEndingIndex = this.layers.length - 1;
  }

  initialize() {
    this.connectLayers();
    this.flattenLayers();
    this.indexLayers();
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      layer.validate(this.layers[i - 1], this.layers[i + 1]);
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

  calculateDeltas(target) {
    this._outputLayer.compare(target);
    for (let i = this.layers.length - 2; i > -1; i--) {
      const previousLayer = this.layers[i - 1];
      const nextLayer = this.layers[i + 1];
      this.layers[i].compare(previousLayer, nextLayer);
    }
  }

  /**
   *
   * @param data
   * @param _options
   * @returns {{error: number, iterations: number}}
   */
  train(data, _options = {}) {
    /* istanbul ignore next */
    const options = Object.assign({}, this.constructor.trainDefaults, _options);
    /* istanbul ignore next */
    data = this.formatData(data);
    /* istanbul ignore next */
    let iterations = options.iterations;
    /* istanbul ignore next */
    let errorThresh = options.errorThresh;
    /* istanbul ignore next */
    let log = options.log === true ? console.log : options.log;
    /* istanbul ignore next */
    let logPeriod = options.logPeriod;
    /* istanbul ignore next */
    let learningRate = _options.learningRate || this.learningRate || options.learningRate;
    /* istanbul ignore next */
    let callback = options.callback;
    /* istanbul ignore next */
    let callbackPeriod = options.callbackPeriod;
    /* istanbul ignore next */
    if (!options.reinforce) {
      /* istanbul ignore next */
      this.initialize();
    }
    /* istanbul ignore next */
    let error = 1;
    /* istanbul ignore next */
    let i;
    /* istanbul ignore next */
    for (i = 0; i < iterations && error > errorThresh; i++) {
      let sum = 0;
      for (let j = 0; j < data.length; j++) {
        /* istanbul ignore next */
        let err = this.trainPattern(data[j].input, data[j].output, learningRate);
        /* istanbul ignore next */
        sum += err;
      }
      /* istanbul ignore next */
      error = sum / data.length;

      /* istanbul ignore next */
      if (log && (i % logPeriod === 0)) {
        log('iterations:', i, 'training error:', error);
      }
      /* istanbul ignore next */
      if (callback && (i % callbackPeriod === 0)) {
        /* istanbul ignore next */
        callback({ error: error, iterations: i });
      }
    }

    /* istanbul ignore next */
    return {
      error: error,
      iterations: i
    };
  }

  /**
   *
   * @param input
   * @param target
   * @param [learningRate]
   */
  trainPattern(input, target, learningRate) {
    learningRate = learningRate || this.learningRate;

    // forward propagate
    this.runInput(input);

    // back propagate
    this.calculateDeltas(target);
    this.adjustWeights(learningRate);

    let error = mse2d(this._outputLayer.errors.hasOwnProperty('toArray') ? this._outputLayer.errors.toArray() : this._outputLayer.errors);
    return error;
  }

  /**
   *
   * @param learningRate
   */
  adjustWeights(learningRate) {
    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i].learn(this.layers[i-1], this.layers[i+1], learningRate);
    }
  }

  /**
   *
   * @param data
   * @returns {*}
   */
  formatData(data) {
    if (data.constructor !== Array) { // turn stream datum into array
      let tmp = [];
      tmp.push(data);
      data = tmp;
    }
    // turn sparse hash input into arrays with 0s as filler
    let datum = data[0].input;
    if (datum.constructor !== Array && !(datum instanceof Float64Array)) {
      if (!this.inputLookup) {
        this.inputLookup = lookup.buildLookup(data.map(value => value['input']));
      }
      data = data.map(datum => {
        let array = lookup.toArray(this.inputLookup, datum.input);
        return Object.assign({}, datum, { input: array });
      }, this);
    }

    if (data[0].output.constructor !== Array) {
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