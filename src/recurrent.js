import RecurrentConnection from './layer/recurrent-connection';
import RecurrentInput from './layer/recurrent-input';
import RecurrentZeros from './layer/recurrent-zeros';
import flattenLayers from './utilities/flatten-layers';
import flattenLayersExcluding from './utilities/flatten-layers-excluding';
import mse2d from './utilities/mse-2d';
import FeedForward from './feed-forward';

export default class Recurrent extends FeedForward {
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
       * _hiddenLayers are a 2 dimensional array of hidden layers defined for each recursion
       * @type Object[][]
       * @private
       */
      _hiddenLayers: null,

      /**
       * _outputLayers are a 1 dimensional array of output layers defined once
       * @type Object[]
       * @private
       */
      _outputLayers: null,
      _praxises: null,
      _outputConnection: null
    };
  }

  _connectLayers() {
    const initialLayers = [];
    const inputLayer = this.inputLayer();
    const hiddenLayers = this._connectHiddenLayers(inputLayer);
    this._outputConnection.setLayer(hiddenLayers[hiddenLayers.length - 1]);
    const outputLayer = this.outputLayer(
      this._outputConnection,
      hiddenLayers.length
    );
    initialLayers.push(inputLayer);
    initialLayers.push.apply(initialLayers, hiddenLayers);
    initialLayers.push(outputLayer);
    const flattenedLayers = flattenLayers(initialLayers);
    this._inputLayers = flattenedLayers.slice(0, flattenedLayers.indexOf(inputLayer) + 1);
    this._hiddenLayers = [flattenedLayers.slice(flattenedLayers.indexOf(inputLayer) + 1, flattenedLayers.indexOf(hiddenLayers[hiddenLayers.length - 1]) + 1)];
    this._outputLayers = flattenedLayers.slice(flattenedLayers.indexOf(hiddenLayers[hiddenLayers.length - 1]) + 1);
    this._outputLayers.unshift();
  }

  _connectHiddenLayers(previousLayer) {
    const hiddenLayers = [];
    for (let i = 0; i < this.hiddenLayers.length; i++) {
      const recurrentInput = new RecurrentZeros();
      const hiddenLayer = this.hiddenLayers[i](previousLayer, recurrentInput, i);
      previousLayer = hiddenLayer;
      hiddenLayers.push(hiddenLayer);
    }
    return hiddenLayers;
  }

  _connectHiddenLayersDeep(previousLayer) {
    const hiddenLayers = [];
    const previousHiddenLayers = this._hiddenLayers[this._hiddenLayers.length - 1];
    for (let i = 0; i < this.hiddenLayers.length; i++) {
      const recurrentInput = new RecurrentInput();
      const hiddenLayer = this.hiddenLayers[i](
        previousLayer,
        recurrentInput,
        i
      );
      previousLayer = hiddenLayer;
      hiddenLayers.push(hiddenLayer);
      recurrentInput.setRecurrentInput(previousHiddenLayers[i]);
      recurrentInput.validate();

    }
    const flattenedHiddenLayers = flattenLayersExcluding(hiddenLayers, this._inputLayers[this._inputLayers.length - 1], previousHiddenLayers[previousHiddenLayers.length - 1]);
    this._hiddenLayers.push(flattenedHiddenLayers);
    return flattenedHiddenLayers;
  }

  initialize() {
    this._praxises = [];
    this._outputConnection = new RecurrentConnection();
    this._connectLayers();
    this.initializeLayers(this._inputLayers);
    this.initializeLayers(this._hiddenLayers[0]);
    this.initializeLayers(this._outputLayers);
  }

  initializeDeep() {
    const input = this._inputLayers[this._inputLayers.length - 1];
    const hiddenLayers = this._connectHiddenLayersDeep(input);
    for (let i = 0; i < hiddenLayers.length; i++) {
      const hiddenLayer = hiddenLayers[i];
      hiddenLayer.reuseKernels(this._hiddenLayers[0][i]);
    }
  }

  runInput(input) {
    for (let x = 0; x < input.length; x++) {
      const hiddenConnection = this._hiddenLayers[x][this._hiddenLayers[x].length - 1];
      this._outputConnection.setLayer(hiddenConnection);
      this._inputLayers[0].predict([input[x]]);
      for (let i = 1; i < this._inputLayers.length; i++) {
        this._inputLayers[i].predict();
      }
      for (let i = 0; i < this._hiddenLayers[x].length; i++) {
        this._hiddenLayers[x][i].predict();
      }
      for (let i = 0; i < this._outputLayers.length; i++) {
        this._outputLayers[i].predict();
      }
    }
    return this._outputLayers[this._outputLayers.length - 1].weights;
  }

  _calculateDeltas(target, offset) {
    for (let x = target.length - 1; x >= 0; x--) {
      const hiddenLayersIndex = offset + x;
      const hiddenConnection = this._hiddenLayers[hiddenLayersIndex][this._hiddenLayers[hiddenLayersIndex].length - 1];
      this._outputConnection.setLayer(hiddenConnection);
      this._outputLayers[this._outputLayers.length - 1].compare([target[x]]);
      for (let i = this._outputLayers.length - 2; i >= 0; i--) {
        this._outputLayers[i].compare();
      }
      for (let i = this._hiddenLayers[hiddenLayersIndex].length - 1; i >= 0; i--) {
        this._hiddenLayers[hiddenLayersIndex][i].compare();
      }
      for (let i = this._inputLayers.length - 1; i >= 0; i--) {
        this._inputLayers[i].compare();
      }
    }
  }

  _adjustWeights() {
    for (let hiddenLayersIndex = 0; hiddenLayersIndex < this._hiddenLayers.length; hiddenLayersIndex++) {
      const hiddenConnection = this._hiddenLayers[hiddenLayersIndex][this._hiddenLayers[hiddenLayersIndex].length - 1];
      this._outputConnection.setLayer(hiddenConnection);
      for (let i = 1; i < this._inputLayers.length; i++) {
        this._inputLayers[i].learn();
      }
      for (let i = 0; i < this._hiddenLayers[hiddenLayersIndex].length; i++) {
        this._hiddenLayers[hiddenLayersIndex][i].learn();
      }
      for (let i = 0; i < this._outputLayers.length; i++) {
        this._outputLayers[i].learn();
      }
    }
  }

  /**
   *
   * @param {number[]} input
   * @param {number[]} target
   * @param {Boolean} [logErrorRate]
   */
  trainPattern(input, target, logErrorRate) {

    // forward propagate
    this.runInput(input);

    // back propagate
    this._calculateDeltas(target, input.length - 1);
    this._calculateDeltas(input.slice(1), 0);
    this._adjustWeights();

    if (logErrorRate) {
      const outputLayer = this._outputLayers[this._outputLayers.length - 1];
      return mse2d(outputLayer.errors.hasOwnProperty('toArray') ? outputLayer.errors.toArray() : outputLayer.errors);
    } else {
      return null
    }
  }
}