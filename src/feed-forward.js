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
  }

  connectLayers() {
    this.layers = [];
    const inputLayer = this.inputLayer(null, this.layers.length);
    this._inputLayer = inputLayer;
    this.layers.push(inputLayer);
    let previousLayer = inputLayer;
    for (let i = 0; i < this.hiddenLayers.length; i++) {
      const hiddenLayer = this.hiddenLayers[i](previousLayer, this.layers.length);
      this.layers.push(hiddenLayer);
      previousLayer = hiddenLayer;
    }
    this._outputLayer = this.outputLayer(previousLayer, this.layers.length);
    this.layers.push(this._outputLayer);

    this.connectNestedLayers();
  }

  connectNestedLayers() {
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

  initialize() {
    this.connectLayers();
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
    const options = Object.assign({}, this.constructor.trainDefaults, _options);
    data = this.formatData(data);
    let iterations = options.iterations;
    let errorThresh = options.errorThresh;
    let log = options.log === true ? console.log : options.log;
    let logPeriod = options.logPeriod;
    let learningRate = _options.learningRate || this.learningRate || options.learningRate;
    let callback = options.callback;
    let callbackPeriod = options.callbackPeriod;
    if (!options.reinforce) {
      this.initialize();
    }

    let error = 1;
    let i;
    for (i = 0; i < iterations && error > errorThresh; i++) {
      let sum = 0;
      for (let j = 0; j < data.length; j++) {
        let err = this.trainPattern(data[j].input, data[j].output, learningRate);
        sum += err;
      }
      error = sum / data.length;

      if (log && (i % logPeriod === 0)) {
        log('iterations:', i, 'training error:', error);
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
    data = this.formatData(data);

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
   */
  toJSON() {
    const jsonLayers = [];
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const jsonLayer = layer.toJSON();
      if (layer.hasOwnProperty('inputLayer')) {
        jsonLayer.inputLayerIndex = this.layers.indexOf(layer.inputLayer);
      } else {
        if (layer.hasOwnProperty('inputLayer1')) {
          jsonLayer.inputLayer1Index = this.layers.indexOf(layer.inputLayer1);
        }
        if (layer.hasOwnProperty('inputLayer2')) {
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
        if (jsonLayer.hasOwnProperty('inputLayer1Index')) {
          const inputLayer = layers[jsonLayer.inputLayer1Index];
          layers.push(layerFromJSON(jsonLayer, inputLayer) || getLayer(jsonLayer, inputLayer));
        }
        if (jsonLayer.hasOwnProperty('inputLayer2Index')) {
          const inputLayer = layers[jsonLayer.inputLayer2Index];
          layers.push(layerFromJSON(jsonLayer, inputLayer) || getLayer(jsonLayer, inputLayer));
        }
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
    throw new Error('not yet implemented');
  }

  /**
   * This will create a TrainStream (WriteStream) for us to send the training data to.
   * @param opts training options
   * @returns {TrainStream|*}
   */
  createTrainStream(opts) {
    throw new Error('not yet implemented');
  }
}