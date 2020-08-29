const { RecurrentConnection } = require('./layer/recurrent-connection');
const { RecurrentInput } = require('./layer/recurrent-input');
const { RecurrentZeros } = require('./layer/recurrent-zeros');
const { Model, InternalModel } = require('./layer/types');
// const { Target } = require('./layer/target');
const flattenLayers = require('./utilities/flatten-layers');
const { FeedForward } = require('./feed-forward');
const { release, clone } = require('./utilities/kernel');

class Recurrent extends FeedForward {
  static get structure() {
    return {
      /**
       *
       * _inputLayers are a 1 dimensional array of input layers defined once
       * @type Object[]
       * @private
       */
      _inputLayers: null,

      /**
       * _hiddenLayers are a 1 dimensional array of hidden layers defined from results from settings.hiddenLayers
       * @type Object[]
       * @private
       */
      _hiddenLayers: null,

      /**
       * _hiddenLayerSets are a 2 dimensional array of hidden layers defined for each recursion
       * @type Object[][]
       * @private
       */
      _hiddenLayerSets: null,

      /**
       * a 2 dimensional array of layers defined for each recursion
       */
      _layerSets: null,
      _hiddenLayerOutputIndices: null,

      /**
       * _outputLayers are a 1 dimensional array of output layers defined once
       * @type Object[]
       * @private
       */
      _outputLayers: null,
      _outputConnection: null,
      _previousInputs: null,
      _model: null,
      _recurrentIndices: null,
    };
  }

  _connectLayers() {
    const inputLayer = this.inputLayer();
    const hiddenLayers = this._connectHiddenLayers(inputLayer);
    const outputLayer = this.outputLayer(hiddenLayers[hiddenLayers.length - 1]);
    return {
      inputLayer,
      hiddenLayers,
      outputLayer,
    };
  }

  _connectLayersDeep() {
    const layers = [];
    const previousLayers = this._layerSets[this._layerSets.length - 1];
    let usedHiddenLayerOutputIndex = 0;

    function findInputLayer(inputLayer) {
      const index = previousLayers.indexOf(inputLayer);
      if (index < 0) throw new Error('unable to find layer');
      return layers[index];
    }

    function layerSettings(layer) {
      return {
        ...layer,
        weights: null,
        deltas: null,
        errors: null,
        praxis: null,
      };
    }

    for (let i = 0; i < previousLayers.length; i++) {
      const previousLayer = previousLayers[i];
      let layer = null;
      switch (Object.getPrototypeOf(previousLayer.constructor).name) {
        case 'Activation': {
          layer = new previousLayer.constructor(
            findInputLayer(previousLayer.inputLayer)
          );
          break;
        }
        case 'EntryPoint': {
          layer = new previousLayer.constructor(layerSettings(previousLayer));
          break;
        }
        case 'Filter': {
          layer = new previousLayer.constructor(
            layerSettings(previousLayer.inputLayer),
            findInputLayer(previousLayer.inputLayer)
          );
          break;
        }
        case 'Internal': {
          const previousHiddenLayerOutput =
            previousLayers[
              this._hiddenLayerOutputIndices[usedHiddenLayerOutputIndex++]
            ];
          switch (previousLayer.constructor.name) {
            case 'RecurrentConnection':
              throw new Error('unfinished');
            case 'RecurrentInput':
              layer = new RecurrentInput(previousHiddenLayerOutput);
              break;
            case 'RecurrentZeros':
            default:
              layer = new RecurrentInput(previousHiddenLayerOutput);
              break;
          }
          break;
        }
        case 'InternalModel':
        case 'Model': {
          layer = previousLayer;
          break;
        }
        case 'Modifier': {
          layer = new previousLayer.constructor(
            findInputLayer(previousLayer.inputLayer)
          );
          break;
        }
        case 'Operator': {
          layer = new previousLayer.constructor(
            findInputLayer(previousLayer.inputLayer1),
            findInputLayer(previousLayer.inputLayer2),
            layerSettings(previousLayer)
          );
          break;
        }
        default:
          throw new Error(
            `hidden layer ${
              previousLayer.constructor.name
            } extends unknown hidden layer ${
              Object.getPrototypeOf(previousLayer.constructor).name
            }`
          );
      }
      layers.push(layer);
    }

    return layers;
  }

  _connectHiddenLayers(previousLayer) {
    const hiddenLayers = [];
    for (let i = 0; i < this.hiddenLayers.length; i++) {
      const recurrentInput = new RecurrentZeros();
      const hiddenLayer = this.hiddenLayers[i](
        previousLayer,
        recurrentInput,
        i
      );
      previousLayer = hiddenLayer;
      hiddenLayers.push(hiddenLayer);
    }
    return hiddenLayers;
  }

  initialize() {
    this.layers = [];
    this._outputConnection = new RecurrentConnection();
    const { inputLayer, hiddenLayers, outputLayer } = this._connectLayers();
    const layerSet = flattenLayers([inputLayer, ...hiddenLayers, outputLayer]);
    this._hiddenLayerOutputIndices = hiddenLayers.map((l) =>
      layerSet.indexOf(l)
    );
    this._layerSets = [layerSet];
    this._model = layerSet.filter(
      (l) => l instanceof Model || l instanceof InternalModel
    );
    this.initializeLayers(layerSet);
  }

  initializeDeep() {
    const layers = this._connectLayersDeep();
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      layer.reuseKernels(this._layerSets[0][i]);
    }
    this._layerSets.push(layers);
  }

  run(input) {
    while (this._layerSets.length <= input.length) {
      this.initializeDeep();
    }
    return super.run(input);
  }

  runInput(input) {
    while (this._layerSets.length < input.length) {
      this.initializeDeep();
    }
    const max = input.length - 1; // last output will be compared with last index
    for (let x = 0; x <= max; x++) {
      const layerSet = this._layerSets[x];
      layerSet[0].predict([new Float32Array([input[x]])]);
      for (let i = 1; i < layerSet.length; i++) {
        layerSet[i].predict();
      }
    }
    const lastLayerUsed = this._layerSets[max];
    const result = lastLayerUsed[lastLayerUsed.length - 1].weights;
    this.end();
    return result;
  }

  end() {
    const x = this._layerSets.length - 1;
    const lastLayerSet = this._layerSets[x];
    lastLayerSet[0].predict([new Float32Array([0])]);
    for (let i = 1; i < lastLayerSet.length; i++) {
      lastLayerSet[i].predict();
    }
  }

  transferData(formattedData) {
    return formattedData;
  }

  _prepTraining(data, options) {
    const stats = super._prepTraining(data, options);

    this.verifyIsInitialized(data);

    return stats;
  }

  /**
   *
   * @param data
   * @returns {Number} error
   */
  _calculateTrainingError(data) {
    let sum = new Float32Array(1);
    for (let i = 0; i < data.length; ++i) {
      const prevSum = sum;
      const error = this._trainPattern(data[i], true);
      sum = this.meanSquaredError.add(sum, error);
      release(error);
      release(prevSum);
    }
    const result = this.meanSquaredError.divide(data.length, sum);
    release(sum);
    if (result.toArray) {
      const resultArray = result.toArray();
      return resultArray[0];
    }
    return result[0];
  }

  formatData(data) {
    return data;
  }

  _calculateDeltas(target) {
    const lastLayerSet = this._layerSets[this._layerSets.length - 1];
    // Iterate from the second to last layer backwards, propagating 0's
    for (let i = lastLayerSet.length - 2; i >= 0; i--) {
      lastLayerSet[i].compare();
    }

    for (let x = target.length - 2; x >= 0; x--) {
      const layerSet = this._layerSets[x];
      layerSet[layerSet.length - 1].compare(new Float32Array([target[x + 1]]));
      for (let i = layerSet.length - 2; i >= 0; i--) {
        layerSet[i].compare();
      }
    }
  }

  adjustWeights() {
    const { _model } = this;
    for (let i = 0; i < _model.length; i++) {
      _model[i].learn();
    }
  }

  /**
   * @param data
   * @private
   */
  _trainPatterns(data) {
    for (let i = 0; i < data.length; ++i) {
      this._trainPattern(data[i], false);
    }
  }

  /**
   *
   * @param {number[]} input
   * @param {Boolean} [logErrorRate]
   */
  _trainPattern(input, logErrorRate) {
    // forward propagate
    this.runInput(input);

    // back propagate
    this._calculateDeltas(input);
    this.adjustWeights();

    if (logErrorRate) {
      const { meanSquaredError } = this;
      let error = new Float32Array(1);
      for (let i = 0, max = input.length - 1; i < max; i++) {
        const layerSet = this._layerSets[i];
        const lastLayer = layerSet[layerSet.length - 1];
        const prevError = error;
        error = meanSquaredError.addAbsolute(prevError, lastLayer.errors);
        release(prevError);
      }
      return clone(meanSquaredError.divide(input.length, error));
    }
    return null;
  }
}

module.exports = {
  Recurrent,
};
