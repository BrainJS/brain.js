import zeros2D from '../utilities/zeros-2d';
import { Internal } from './types';

export default class RecurrentZeros extends Internal {
  setDimensions(width, height) {
    this.praxis = null;
    this.width = width;
    this.height = height;
    this.weights = new zeros2D(width, height);
    this.deltas = new zeros2D(width, height);
  }
  setupKernels() {}
  reuseKernels() {}
  predict() {}
  compare() {}
  learn(previousLayer, nextLayer, learningRate) {
    this.weights = this.praxis.run(this, previousLayer, nextLayer, learningRate);
    this.deltas = zeros2D(this.width, this.height);
  }
  validate() {}
  reset() {}
}