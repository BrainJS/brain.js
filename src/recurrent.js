import RecurrentInput from './layer/recurrent-input';
import FeedForward from './feed-forward';
import randos2D from './utilities/randos-2d';
import zeros2D from './utilities/zeros-2d';

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
      recurrentInput.setDimensions(width, height);
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

    for (let x = 1; x < input.length; x++) {
      this.cacheWeights();
      this.layers[0].predict(input[x]);
      for (let i = 1; i <= this._outputLayerEndingIndex; i++) {
        const layer = this.layers[i];
        layer.weights = randos2D(layer.width, layer.height);
        layer.predict();
      }
    }

    return this.layers[this.layers.length - 1].weights;
  }

  calculateDeltas(target) {
    this._outputLayer.compare(target[target.length - 1]);
    for (let i = this.layers.length - 2; i > -1; i--) {
      const previousLayer = this.layers[i - 1];
      const nextLayer = this.layers[i + 1];
      this.layers[i].compare(previousLayer, nextLayer);
    }

    for (let x = target.length - 2; x >= 0; x--) {
      this.cacheDeltas();
      this._outputLayer.compare(target[x]);
      for (let i = this.layers.length - 2; i > -1; i--) {
        const previousLayer = this.layers[i - 1];
        const nextLayer = this.layers[i + 1];
        this.layers[i].compare(previousLayer, nextLayer);
      }
    }
  }

  cacheWeights() {
    const cache = [];
    for (let i = 0; i < this.layers.length; i++) {
      cache.push(this.layers[i].weights);
    }
    this.weightsCache.push(cache);
  }

  cacheDeltas() {
    const cache = [];
    for (let i = 0; i < this.layers.length; i++) {
      cache.push(this.layers[i].deltas);
    }
    this.deltasCache.unshift(cache);
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