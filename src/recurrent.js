import FeedForward from './feed-forward';


export default class Recurrent extends FeedForward {
  constructor(settings) {
    super(settings);
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
}