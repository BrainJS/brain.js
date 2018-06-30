export default class RecurrentConnection {
  setLayer(layer) {
    this.layer = layer;
  }
  get width() {
    return this.layer.width;
  }
  get height() {
    return this.layer.height;
  }
  get deltas() {
    return this.layer.deltas;
  }
  set deltas(deltas) {
    this.layer.deltas = deltas;
  }
  get weights() {
    return this.layer.weights;
  }
  set weights(weights) {
    this.layer.weights = weights;
  }
  predict() {}
  compare() {}
  learn() {}
  setupKernels() {}
  reuseKernels() {}
}