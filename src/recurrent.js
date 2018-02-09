import RecurrentInput from './layer/recurrent-input';
import FeedForward from './feed-forward';

export default class Recurrent extends FeedForward {
  constructor(settings) {
    super(settings);
    this.recurrentLayers = [];
    this.weightsCache = [];
    this.deltasCache = [];
  }

  connectHiddenLayers() {
    for (let i = 0; i < this.hiddenLayers.length; i++) {
      const previousLayer = this.layers[this.layers.length - 1];
      const recurrentInput = new RecurrentInput();
      const hiddenLayer = this.hiddenLayers[i](previousLayer, recurrentInput, this.layers.length);
      const { width, height } = hiddenLayer;
      recurrentInput.width = width;
      recurrentInput.height = height;
      this._lastHiddenLayer = hiddenLayer;
      this.layers.push(hiddenLayer);
    }
  }

  //TODO this is pseudo scripted
  laterOnWhenTraining() {
    const { prevWeights, prevDeltas } = this.hiddenCache[i - 1];
    const { weights, deltas } = this.hiddenCache[i];
    const { nextWeights, nextDeltas } = this.hiddenCache[i + 1];
    const prevLayer = this.layers[i - 1];
    const layer = this.layers[i];
    const nextLayer = this.layers[i + 1];
    layer.weights = weights;
    layer.deltas = deltas;
    layer.predict();

    // loopholes
    layer.compare(prevLayer, nextLayer);
    layer.learn();
  }

  runInput(input) {
    this.layers[0].predict(input[0]);
    for (let i = 1; i <= this._hiddenLayerEndingIndex; i++) {
      this.layers[i].predict();
    }
    let cache = this.cacheWeights();

    for (let x = 1; x < input.length; x++) {
      this.layers[0].predict(input[x]);
      for (let i = 1; i <= this._hiddenLayerEndingIndex; i++) {
        this.layers[i].predict();
      }
      cache = this.cacheWeights();
    }

    for (let i = this._outputLayerStartingIndex; i <= this._outputLayerEndingIndex; i++) {
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

  cacheWeights() {
    const cache = [];
    for (let i = 0; i < this.recurrentLayers.length; i++) {
      cache.push(this.recurrentLayers.weights);
    }
    this.weightsCache.push(cache);
    return cache;
  }

  cacheDeltas() {
    const cache = [];
    for (let i = 0; i < this.recurrentLayers.length; i++) {
      cache.push(this.recurrentLayers.deltas);
    }
    this.deltasCache.push(cache);
  }

  uncacheWeights() {
    const cache = this.weightsCache.pop();
    for (let i = 0; i < this.recurrentLayers.length; i++) {
      this.recurrentLayers.weights = cache[i];
    }
  }

  uncacheDeltas() {
    const cache = this.deltasCache.pop();
    for (let i = 0; i < this.recurrentLayers.length; i++) {
      this.recurrentLayers.deltas = cache[i];
    }
  }
}