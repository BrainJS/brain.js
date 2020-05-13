const lookup = require('./lookup');
const layerFromJSON = require('./utilities/layer-from-json');
const praxis = require('./praxis');
const flattenLayers = require('./utilities/flatten-layers');
const { makeKernel, release } = require('./utilities/kernel');
const { MeanSquaredError } = require('./estimator/mean-squared-error');
const { Model } = require('./layer/types');

class FeedForward {
  static get trainDefaults() {
    return {
      iterations: 20000,
      errorThresh: 0.005,
      log: false,
      logPeriod: 10,
      learningRate: 0.3,
      callback: null,
      callbackPeriod: 10,
      errorCheckInterval: 100,
      reinforce: false,
    };
  }

  static get defaults() {
    return {
      learningRate: 0.3,
      binaryThresh: 0.5,
      hiddenLayers: null,
      inputLayer: null,
      outputLayer: null,
      praxisOpts: null,
      praxis: (layer, settings) =>
        praxis.momentumRootMeanSquaredPropagation(
          { ...layer },
          layer.praxisOpts || settings
        ),
    };
  }

  /**
   *
   * @param options
   * @private
   */
  static _validateTrainingOptions(options) {
    const validations = {
      iterations: (val) => typeof val === 'number' && val > 0,
      errorThresh: (val) => typeof val === 'number' && val > 0 && val < 1,
      log: (val) => typeof val === 'function' || typeof val === 'boolean',
      logPeriod: (val) => typeof val === 'number' && val > 0,
      learningRate: (val) => typeof val === 'number' && val > 0 && val < 1,
      callback: (val) => typeof val === 'function' || val === null,
      callbackPeriod: (val) => typeof val === 'number' && val > 0,
      timeout: (val) => typeof val === 'number' && val > 0,
    };
    Object.keys(FeedForward.trainDefaults).forEach((key) => {
      if (validations.hasOwnProperty(key) && !validations[key](options[key])) {
        throw new Error(
          `[${key}, ${options[key]}] is out of normal training range, your network will probably not train.`
        );
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
    if (typeof log === 'function') {
      this.trainOpts.log = log;
    } else if (log) {
      // eslint-disable-next-line
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
   *       learningRate: (number)
   */
  _updateTrainingOptions(opts) {
    Object.keys(this.constructor.trainDefaults).forEach((opt) => {
      this.trainOpts[opt] = opts.hasOwnProperty(opt)
        ? opts[opt]
        : this.trainOpts[opt];
    });
    this.constructor._validateTrainingOptions(this.trainOpts);
    this._setLogMethod(opts.log || this.trainOpts.log);
    if (
      this.trainOpts.callback &&
      this.trainOpts.callbackPeriod !== this.trainOpts.errorCheckInterval
    ) {
      console.warn(
        `options.callbackPeriod with value of ${this.trainOpts.callbackPeriod} does not match options.errorCheckInterval with value of ${this.trainOpts.errorCheckInterval}, if logging error, it will repeat.  These values may need to match`
      );
    }
  }

  static get structure() {
    return {
      layers: null,
      _inputLayer: null,
      _outputLayer: null,
      _model: null,
    };
  }

  /**
   *
   * @param {object} options
   * @constructor
   */
  constructor(options = {}) {
    this.layers = null;
    this.inputLayer = null;
    this.hiddenLayers = null;
    this.outputLayer = null;
    this.praxisOpts = null;
    this.praxis = null;
    Object.assign(this, this.constructor.defaults, options);
    this.trainOpts = {};
    this._updateTrainingOptions({
      ...this.constructor.trainDefaults,
      ...options,
    });
    Object.assign(this, this.constructor.structure);
    this._inputLayer = null;
    this._hiddenLayers = null;
    this._outputLayer = null;
  }

  _connectLayers() {
    const layers = [];
    this._inputLayer = this.inputLayer();
    const hiddenLayers = this._connectHiddenLayers(this._inputLayer);
    this._outputLayer = this.outputLayer(
      hiddenLayers[hiddenLayers.length - 1],
      hiddenLayers.length
    );
    layers.push(this._inputLayer);
    layers.push(...hiddenLayers);
    layers.push(this._outputLayer);
    this.layers = flattenLayers(layers);
  }

  _connectHiddenLayers(previousLayer) {
    this._hiddenLayers = [];
    const hiddenLayers = [];
    for (let i = 0; i < this.hiddenLayers.length; i++) {
      const hiddenLayer = this.hiddenLayers[i](previousLayer, i);
      hiddenLayers.push(hiddenLayer);
      this._hiddenLayers.push(hiddenLayer);
      previousLayer = hiddenLayer;
    }
    return hiddenLayers;
  }

  initialize() {
    this._connectLayers();
    this.initializeLayers(this.layers);
    this._model = this.layers.filter((l) => l instanceof Model);
  }

  initializeLayers(layers) {
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      // TODO: optimize for when training or just running
      layer.setupKernels(true);
      if (
        layer instanceof Model &&
        layer.hasOwnProperty('praxis') &&
        layer.praxis === null
      ) {
        layer.praxis = this.praxis(layer, layer.praxisOpts || this.praxisOpts);
        layer.praxis.setupKernels();
      }
    }

    const lastLayer = layers[layers.length - 1];
    this.meanSquaredError = new MeanSquaredError({
      width: lastLayer.width,
      height: lastLayer.height,
    });
    // this._getMSE = makeKernel(mse2d, {
    //   output: [1],
    //   constants: {
    //     width: this._outputLayer.width,
    //     height: this._outputLayer.height,
    //     length: this._outputLayer.width * this._outputLayer.height,
    //   }
    // });
    // this._addMSE = makeKernel(function(value1, value2) {
    //   return value1[0] + value2[0];
    // }, {
    //   output: [1]
    // });
    // this._divideMSESum = makeKernel(function(length, mseSum) {
    //   const value = mseSum[0];
    //   if (value > 0) {
    //     return value / length;
    //   }
    //   return 0;
    // }, {
    //   output: [1]
    // });
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

    if (output.toArray) {
      output = output.toArray();
    }

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
    let status;
    let endTime;
    ({ data, status, endTime } = this._prepTraining(data, options));

    while (this._trainingTick(data, status, endTime));
    return status;
  }

  /**
   *
   * @param {object} data
   * @param {object} status { iterations: number, error: number }
   * @param {Number} endTime
   */
  _trainingTick(data, status, endTime) {
    if (
      status.iterations >= this.trainOpts.iterations ||
      status.error <= this.trainOpts.errorThresh ||
      Date.now() >= endTime
    ) {
      return false;
    }

    if (
      this.trainOpts.log &&
      status.iterations % this.trainOpts.logPeriod === 0
    ) {
      status.error = this._calculateTrainingError(data);
      this.trainOpts.log(
        `iterations: ${status.iterations}, training error: ${status.error}`
      );
    } else if (status.iterations % this.trainOpts.errorCheckInterval === 0) {
      status.error = this._calculateTrainingError(data);
    } else {
      this._trainPatterns(data);
    }

    if (
      this.trainOpts.callback &&
      status.iterations % this.trainOpts.callbackPeriod === 0
    ) {
      this.trainOpts.callback(Object.assign(status));
    }

    status.iterations++;
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

    const formattedData = this.formatData(data);
    const endTime = Date.now() + this.trainOpts.timeout;

    const status = {
      error: 1,
      iterations: 0,
    };

    this.verifyIsInitialized();

    return {
      data: this.transferData(formattedData),
      status,
      endTime,
    };
  }

  verifyIsInitialized() {
    if (!this._model) {
      this.initialize();
    }
  }

  /**
   *
   * @param data
   * @returns {Number} error
   */
  _calculateTrainingError(data) {
    let sum = new Float32Array([0]);
    for (let i = 0; i < data.length; ++i) {
      const prevSum = sum;
      const error = this._trainPattern(data[i].input, data[i].output, true);
      sum = this.meanSquaredError.add(sum, error);
      release(error);
      release(prevSum);
    }
    const result = this.meanSquaredError.divide(data.length, sum);
    release(sum);
    if (result.toArray) {
      const resultArray = result.toArray();
      release(result);
      return resultArray[0];
    }
    return result[0];
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
   * @param {Boolean} logErrorRate
   */
  _trainPattern(input, target, logErrorRate) {
    // forward propagate
    this.runInput(input);

    // back propagate
    this._calculateDeltas(target);
    this.adjustWeights();

    if (logErrorRate) {
      return this.meanSquaredError.calculate(this._outputLayer.errors);
    }
    return null;
  }

  _calculateDeltas(target) {
    for (let i = this.layers.length - 1; i > -1; i--) {
      this.layers[i].compare(target);
    }
  }

  /**
   *
   */
  adjustWeights() {
    const { _model } = this;
    for (let i = 0; i < _model.length; i++) {
      _model[i].learn(null, null, this.trainOpts.learningRate);
    }
  }

  /**
   *
   * @param data
   * @returns {*}
   */
  formatData(data) {
    if (!Array.isArray(data)) {
      // turn stream datum into array
      const tmp = [];
      tmp.push(data);
      data = tmp;
    }

    // turn sparse hash input into arrays with 0s as filler
    const inputDatumCheck = data[0].input;
    if (
      !Array.isArray(inputDatumCheck) &&
      !(inputDatumCheck instanceof Float32Array)
    ) {
      if (!this.inputLookup) {
        this.inputLookup = lookup.buildLookup(data.map((value) => value.input));
      }
      data = data.map((datumParam) => {
        const array = lookup.toArray(this.inputLookup, datumParam.input);
        return { ...datumParam, input: array };
      }, this);
    }

    const outputDatumCheck = data[0].output;
    if (
      !Array.isArray(outputDatumCheck) &&
      !(outputDatumCheck instanceof Float32Array)
    ) {
      if (!this.outputLookup) {
        this.outputLookup = lookup.buildLookup(
          data.map((value) => value.output)
        );
      }
      data = data.map((datumParam) => {
        const array = lookup.toArray(this.outputLookup, datumParam.output);
        return { ...datumParam, output: array };
      }, this);
    }
    return data;
  }

  transferData(formattedData) {
    const transferredData = new Array(formattedData.length);
    const transferInput = makeKernel(
      function (value) {
        return value[this.thread.x];
      },
      {
        output: [formattedData[0].input.length],
        immutable: true,
      }
    );
    const transferOutput = makeKernel(
      function (value) {
        return value[this.thread.x];
      },
      {
        output: [formattedData[0].output.length],
        immutable: true,
      }
    );

    for (let i = 0; i < formattedData.length; i++) {
      const formattedDatum = formattedData[i];
      transferredData[i] = {
        input: transferInput(formattedDatum.input),
        output: transferOutput(formattedDatum.output),
      };
    }
    return transferredData;
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
   */
  toJSON() {
    if (!this.layers) {
      this.initialize();
    }
    const jsonLayers = [];
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const jsonLayer = layer.toJSON();
      if (layer.hasOwnProperty('inputLayer')) {
        jsonLayer.inputLayerIndex = this.layers.indexOf(layer.inputLayer);
      } else if (
        layer.hasOwnProperty('inputLayer1') &&
        layer.hasOwnProperty('inputLayer2')
      ) {
        jsonLayer.inputLayer1Index = this.layers.indexOf(layer.inputLayer1);
        jsonLayer.inputLayer2Index = this.layers.indexOf(layer.inputLayer2);
      }
      jsonLayers.push(jsonLayer);
    }

    return {
      type: this.constructor.name,
      sizes: [this._inputLayer.height]
        .concat(this._hiddenLayers.map((l) => l.height))
        .concat([this._outputLayer.height]),
      layers: jsonLayers,
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
        const inputLayer1 = layers[jsonLayer.inputLayerIndex];
        layers.push(
          layerFromJSON(jsonLayer, inputLayer1) ||
            getLayer(jsonLayer, inputLayer1)
        );
      } else {
        if (!jsonLayer.hasOwnProperty('inputLayer1Index'))
          throw new Error(
            'Cannot create network from provided JOSN. inputLayer1Index not defined.'
          );
        if (!jsonLayer.hasOwnProperty('inputLayer2Index'))
          throw new Error(
            'Cannot create network from provided JOSN. inputLayer2Index not defined.'
          );
        const inputLayer1 = layers[jsonLayer.inputLayer1Index];
        const inputLayer2 = layers[jsonLayer.inputLayer2Index];

        if (inputLayer1 === undefined)
          throw new Error(
            `Cannot create network from provided JOSN. layer of index ${jsonLayer.inputLayer1Index} not found.`
          );
        if (inputLayer2 === undefined)
          throw new Error(
            `Cannot create network from provided JOSN. layer of index ${jsonLayer.inputLayer2Index} not found.`
          );

        layers.push(
          layerFromJSON(jsonLayer, inputLayer) ||
            getLayer(jsonLayer, inputLayer1, inputLayer2)
        );
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
    throw new Error(
      `${this.constructor.name}-toFunction is not yet implemented`
    );
  }

  /**
   * This will create a TrainStream (WriteStream) for us to send the training data to.
   * @param opts training options
   * @returns {TrainStream|*}
   */
  createTrainStream() {
    throw new Error(
      `${this.constructor.name}-createTrainStream is not yet implemented`
    );
  }
}

module.exports = {
  FeedForward,
};
