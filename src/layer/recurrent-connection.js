import { Internal } from './types';
import zeros2D from "../utilities/zeros-2d";

export default class RecurrentConnection extends Internal {
  setLayer(layer) {
    this.layer = layer;
  }
  get width() {
    return this.layer.width;
  }
  set width(value) {}
  get height() {
    return this.layer.height;
  }
  set height(value) {}
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
  learn() {
    this.layer.deltas = zeros2D(this.width, this.height);
  }
  setupKernels() {}
  reuseKernels() {}
}