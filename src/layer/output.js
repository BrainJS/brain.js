import Base from './base';
import makeKernel from '../utilities/make-kernel';
import randos2D from "../utilities/randos-2d";
import zeros2D from "../utilities/zeros-2d";

export default class Output extends Base {
  constructor(settings, inputLayer) {
    super(settings);
    this.inputLayer = inputLayer;
    this.weights = randos2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
  }

  setupKernels() {}

  predict() {}

  compare(target) {
    // this is where weights attach to deltas
    this.inputLayer.deltas = this.inputLayer.weights;
  }

  learn(previousLayer, nextLayer, learningRate) {}
}