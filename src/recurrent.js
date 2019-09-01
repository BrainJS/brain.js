const { RecurrentConnection } = require('./layer/recurrent-connection');
const { RecurrentInput } = require('./layer/recurrent-input');
const { RecurrentZeros } = require('./layer/recurrent-zeros');
const flattenLayers = require('./utilities/flatten-layers');
const mse2d = require('./utilities/mse-2d');
const { FeedForward } = require('./feed-forward');
// const Base from './layer/base'

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
    const initialLayers = [];
    const inputLayer = this.inputLayer();
    this._inputLayer = inputLayer;
    this.layers.push(inputLayer);
    const hiddenLayers = this._connectHiddenLayers(inputLayer);
    this._hiddenLayerSets = hiddenLayers;
    this._outputConnection.setLayer(hiddenLayers[hiddenLayers.length - 1]);
    const outputLayer = this.outputLayer(
      this._outputConnection,
      hiddenLayers.length
    );
    this._outputLayer = outputLayer;
    this.layers.push(outputLayer);
    initialLayers.push(inputLayer);
    initialLayers.push(...hiddenLayers);
    initialLayers.push(outputLayer);
    const flattenedLayers = flattenLayers(initialLayers);
    this._inputLayers = flattenedLayers.slice(
      0,
      flattenedLayers.indexOf(inputLayer) + 1
    );
    this._hiddenLayerSets = [
      flattenedLayers.slice(
        flattenedLayers.indexOf(inputLayer) + 1,
        flattenedLayers.indexOf(hiddenLayers[hiddenLayers.length - 1]) + 1
      ),
    ];
    this._outputLayers = flattenedLayers.slice(
      flattenedLayers.indexOf(hiddenLayers[hiddenLayers.length - 1]) + 1
    );
    this._outputLayers.unshift();
    this._recurrentIndices = [];
    this._model = [];
    for (let i = 0; i < this._hiddenLayerSets[0].length; i++) {
      if (
        Object.getPrototypeOf(this._hiddenLayerSets[0][i].constructor).name ===
        'Model'
      ) {
        this._model.push(this._hiddenLayerSets[0][i]);
        this._hiddenLayerSets[0].splice(i, 1);
      }
    }
    for (let i = 0; i < hiddenLayers.length; i++) {
      this._recurrentIndices.push(
        this._hiddenLayerSets[0].indexOf(hiddenLayers[i])
      );
    }
  }

  _connectHiddenLayers(previousLayer) {
    this._hiddenLayers = [];
    const hiddenLayers = [];
    for (let i = 0; i < this.hiddenLayers.length; i++) {
      const recurrentInput = new RecurrentZeros();
      const hiddenLayer = this.hiddenLayers[i](previousLayer, recurrentInput, i);
      this._hiddenLayers.push(hiddenLayer);
      previousLayer = hiddenLayer;
      hiddenLayers.push(hiddenLayer);
      this.layers.push(hiddenLayer);
    }
    return hiddenLayers;
  }

  _connectHiddenLayersDeep() {
    const hiddenLayers = [];
    const previousHiddenLayers = this._hiddenLayerSets[
      this._hiddenLayerSets.length - 1
    ];
    const firstLayer = this._hiddenLayerSets[0];
    let recurrentIndex = 0;
    for (let i = 0; i < previousHiddenLayers.length; i++) {
      const previousHiddenLayer = previousHiddenLayers[i];
      let layer = null;
      switch (Object.getPrototypeOf(firstLayer[i].constructor).name) {
        case 'Activation': {
          const inputLayer =
            hiddenLayers[
              previousHiddenLayers.indexOf(previousHiddenLayer.inputLayer)
            ] || previousHiddenLayer.inputLayer;
          layer = new previousHiddenLayer.constructor(inputLayer);
          break;
        }
        case 'Filter': {
          const settings = previousHiddenLayer;
          const inputLayer =
            hiddenLayers[
              previousHiddenLayers.indexOf(previousHiddenLayer.inputLayer)
            ] || previousHiddenLayer.inputLayer;
          layer = new previousHiddenLayer.constructor(settings, inputLayer);
          break;
        }
        case 'Internal': {
          switch (previousHiddenLayer.constructor.name) {
            case 'RecurrentConnection':
              break;
            case 'RecurrentInput':
            case 'RecurrentZeros':
            default:
              layer = new RecurrentInput();
              layer.setDimensions(
                previousHiddenLayer.width,
                previousHiddenLayer.height
              );
              layer.setRecurrentInput(
                previousHiddenLayers[this._recurrentIndices[recurrentIndex]]
              );
              recurrentIndex++;
              break;
          }
          break;
        }
        case 'Model': {
          layer = previousHiddenLayer;
          break;
        }
        case 'Modifier': {
          const inputLayer =
            hiddenLayers[
              previousHiddenLayers.indexOf(previousHiddenLayer.inputLayer)
            ] || previousHiddenLayer.inputLayer;
          layer = new previousHiddenLayer.constructor(inputLayer);
          break;
        }
        case 'Operator': {
          const inputLayer1 =
            hiddenLayers[
              previousHiddenLayers.indexOf(previousHiddenLayer.inputLayer1)
            ] || previousHiddenLayer.inputLayer1;
          const inputLayer2 =
            hiddenLayers[
              previousHiddenLayers.indexOf(previousHiddenLayer.inputLayer2)
            ] || previousHiddenLayer.inputLayer2;
          layer = new previousHiddenLayer.constructor(inputLayer1, inputLayer2);
          break;
        }
        default:
          throw new Error(
            `hidden layer ${
              previousHiddenLayer.constructor.name
            } extends unknown hidden layer ${
              Object.getPrototypeOf(previousHiddenLayer.constructor).name
            }`
          );
      }

      hiddenLayers[i] = layer;
    }
    this._hiddenLayerSets.push(hiddenLayers);
    return hiddenLayers;
  }

  initialize() {
    this.layers = [];
    this._previousInputs = [];
    this._outputConnection = new RecurrentConnection();
    this._connectLayers();
    this.initializeLayers(this._model);
    this.initializeLayers(this._inputLayers);
    this.initializeLayers(this._hiddenLayerSets[0]);
    this.initializeLayers(this._outputLayers);
  }

  initializeDeep() {
    const hiddenLayers = this._connectHiddenLayersDeep();
    for (let i = 0; i < hiddenLayers.length; i++) {
      const hiddenLayer = hiddenLayers[i];
      hiddenLayer.reuseKernels(this._hiddenLayerSets[0][i]);
    }
  }

  runInput(input) {
    const max = input.length - 1;
    for (let x = 0; x < max; x++) {
      const hiddenLayers = this._hiddenLayerSets[x];
      const hiddenConnection = hiddenLayers[hiddenLayers.length - 1];
      this._outputConnection.setLayer(hiddenConnection);

      this._inputLayers[0].predict([input[x]]);
      this._previousInputs.push(this._inputLayers[0].weights);
      for (let i = 1; i < this._inputLayers.length; i++) {
        this._inputLayers[i].predict();
      }
      for (let i = 0; i < this._hiddenLayerSets[x].length; i++) {
        this._hiddenLayerSets[x][i].predict();
      }
      for (let i = 0; i < this._outputLayers.length; i++) {
        this._outputLayers[i].predict();
      }
    }
    return this._outputLayers[this._outputLayers.length - 1].weights;
  }

  _prepTraining(data, options) {
    const stats = super._prepTraining(data, options);
    this.initializeDeep();
    return stats;
  }

  _calculateDeltas(target, offset) {
    for (let x = target.length - 1; x >= 0; x--) {
      const hiddenLayersIndex = offset + x;
      const hiddenLayers = this._hiddenLayerSets[hiddenLayersIndex];
      const hiddenConnection = hiddenLayers[hiddenLayers.length - 1];
      this._outputConnection.setLayer(hiddenConnection);
      if (this._previousInputs.length > 0) {
        this._inputLayers[0].weights = this._previousInputs.pop();
      }

      this._outputLayers[this._outputLayers.length - 1].compare([[target[x]]]);
      for (let i = this._outputLayers.length - 2; i >= 0; i--) {
        this._outputLayers[i].compare();
      }
      for (let i = hiddenLayers.length - 1; i >= 0; i--) {
        hiddenLayers[i].compare();
      }
      for (let i = this._inputLayers.length - 1; i >= 1; i--) {
        this._inputLayers[i].compare();
      }
    }
  }

  adjustWeights() {
    for (
      let hiddenLayersIndex = 0;
      hiddenLayersIndex < this._hiddenLayerSets.length;
      hiddenLayersIndex++
    ) {
      const hiddenLayers = this._hiddenLayerSets[hiddenLayersIndex];
      const hiddenConnection = hiddenLayers[hiddenLayers.length - 1];
      this._outputConnection.setLayer(hiddenConnection);
      for (let i = 0; i < this._inputLayers.length; i++) {
        this._inputLayers[i].learn();
      }

      for (let i = 0; i < hiddenLayers.length; i++) {
        hiddenLayers[i].learn();
      }

      for (let i = 0; i < this._outputLayers.length; i++) {
        this._outputLayers[i].learn();
      }

      for (let i = 0; i < this._model.length; i++) {
        this._model[i].learn();
      }
    }
  }

  /**
   *
   * @param {number[]} input
   * @param {number[]} target
   * @param {Boolean} [logErrorRate]
   */
  _trainPattern(input, target, logErrorRate) {
    // forward propagate
    this.runInput(input);

    // back propagate
    this._calculateDeltas(target, input.length - 1);
    this._calculateDeltas(input.slice(1), 0);
    this.adjustWeights();

    if (logErrorRate) {
      const outputLayer = this._outputLayers[this._outputLayers.length - 1];
      return mse2d(
        outputLayer.errors.hasOwnProperty('toArray')
          ? outputLayer.errors.toArray()
          : outputLayer.errors
      );
    }
    return null;
  }
}

module.exports = {
  Recurrent
};
