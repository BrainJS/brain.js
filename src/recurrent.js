import RecurrentInput from './layer/recurrent-input';
import RecurrentZeros from './layer/recurrent-zeros';
import flattenLayers from './utilities/flatten-layers';
import * as praxis from "./praxis";
import mse2d from "./utilities/mse-2d";

export default class Recurrent {
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
  constructor(settings) {
    this.layers = null;
    this._inputLayers = null;
    this._hiddenLayers = null;
    this._outputLayers = null;
    this._praxises = null;

    Object.assign(this, this.constructor.defaults, settings);
  }

  connectLayers() {
    const layers = [];
    const inputLayer = this.inputLayer(null, layers.length);
    this._inputLayers.push(inputLayer);
    layers.push(inputLayer);
    this.connectHiddenLayers(layers, inputLayer);
    const outputLayer = this.outputLayer(layers[layers.length - 1], layers.length);
    this._outputLayers.push(outputLayer);
    layers.push(outputLayer);
    return layers;
  }

  connectLayersDeep() {
    const layers = [];
    const inputLayer = this.inputLayer(null, layers.length);
    this._inputLayers.push(inputLayer);
    layers.push(inputLayer);
    this.connectHiddenLayersDeep(layers, inputLayer);
    const outputLayer = this.outputLayer(layers[layers.length - 1], layers.length);
    this._outputLayers.push(outputLayer);
    layers.push(outputLayer);
    return layers;
  }

  connectHiddenLayers(layers, previousLayer) {
    const hiddenLayers = [];
    for (let i = 0; i < this.hiddenLayers.length; i++) {
      const recurrentInput = new RecurrentZeros();
      const hiddenLayer = this.hiddenLayers[i](previousLayer, recurrentInput, layers.length);
      previousLayer = hiddenLayer;
      const { width, height } = hiddenLayer;
      recurrentInput.setDimensions(width, height);
      layers.push(hiddenLayer);
      hiddenLayers.push(hiddenLayer);
    }
    this._hiddenLayers = [hiddenLayers];
  }

  connectHiddenLayersDeep(layers, previousLayer) {
    const hiddenLayers = [];
    const previousHiddenLayers = this._hiddenLayers[this._hiddenLayers.length - 1];
    for (let i = 0; i < this.hiddenLayers.length; i++) {
      const recurrentInput = new RecurrentInput();
      const hiddenLayer = this.hiddenLayers[i](previousLayer, recurrentInput, layers.length);
      previousLayer = hiddenLayer;
      const { width, height } = hiddenLayer;
      recurrentInput.setDimensions(width, height);
      recurrentInput.setRecurrentInput(previousHiddenLayers[i]);
      layers.push(hiddenLayer);
      hiddenLayers.push(hiddenLayer);
    }
    this._hiddenLayers.push(hiddenLayers);
  }

  initialize() {
    this._praxises = [];
    this._inputLayers = [];
    this._hiddenLayers = [];
    this._outputLayers = [];
    this.layers = [];
    const layers = flattenLayers(this.connectLayers());
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      layer.validate();
      layer.setupKernels();
      if (layer.hasOwnProperty('praxis') && layer.praxis === null) {
        layer.praxis = this.praxis(layer);
      }
      this._praxises.push(layer.praxis);
    }
    this.layers.push(layers);
    return layers;
  }

  initializeDeep() {
    const layers = flattenLayers(this.connectLayersDeep());
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      layer.reuseKernels(this.layers[0][i]);
      layer.praxis = this.layers[0][i].praxis;
    }
    this.layers.push(layers);
    return layers;
  }

  train(input) {
    while (input.length < this.layers.length) {
      this.initializeDeep();
    }
    const initialLayers = this.initialize();
    this.layers = [initialLayers];

    this.layers.push(this.initializeDeep());
  }

  runInput(input) {
    for (let x = 0; x < input.length; x++) {
      const layers = this.layers[x];
      layers[0].predict([input[x]]);
      for (let i = 1; i < layers.length; i++) {
        const previousLayer = layers[i - 1];
        const nextLayer = layers[i + 1];
        layers[i].predict(previousLayer, nextLayer);
      }
    }

    const lastLayers = this.layers[this.layers.length - 1];
    return lastLayers[lastLayers.length - 1].weights;
  }

  calculateDeltas(target) {
    for (let x = target.length - 1; x >= 0; x--) {
      const layers = this.layers[x];
      layers[layers.length - 1].compare([target[x]]);
      for (let i = layers.length - 2; i > -1; i--) {
        const previousLayer = layers[i - 1];
        const nextLayer = layers[i + 1];
        layers[i].compare(previousLayer, nextLayer);
      }
    }
  }

  adjustWeights(learningRate) {
    for (let x = 0; x < this.layers.length; x++) {
      const layers = this.layers[x];
      for (let i = 0; i < layers.length; i++) {
        layers[i].learn(layers[i - 1], layers[i + 1], learningRate);
      }
    }
  }

  trainPattern(input, learningRate) {
    learningRate = learningRate || this.learningRate;

    // forward propagate
    this.runInput(input);

    // back propagate
    this.calculateDeltas(input);
    this.adjustWeights(learningRate);

    const outputLayer = this._outputLayers[this._outputLayers.length - 1];
    let error = mse2d(outputLayer.errors.hasOwnProperty('toArray') ? outputLayer.errors.toArray() : outputLayer.errors);
    return error;
  }
}