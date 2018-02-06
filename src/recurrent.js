import FeedForward from './feed-forward';

export default class Recurrent extends FeedForward {
  constructor(settings) {
    super(settings);
    this.recurrentLayers = [];
    this.weightsCache = [];
    this.deltasCache = [];
  }

  initialize() {
    super.initialize();
    for (let i = this._hiddenLayerStartingIndex; i < this._hiddenLayerEndingIndex; i++) {
      this.recurrentLayers.push(this.layers[i]);
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
    for (let x = 1; x < input.length; x++) {
      for (let i = 1; i <= this._inputLayerEndingIndex; i++) {
        this.layers[i].predict(input[x]);
      }
      for (let i = this._hiddenLayerStartingIndex; i <= this._hiddenLayerEndingIndex; i++) {
        this.layers[i].predict();
      }
      this.cacheWeights();
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