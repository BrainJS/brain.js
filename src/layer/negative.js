import makeKernel from '../utilities/make-kernel';
import { Modifier } from './types';

export default class Negative extends Modifier {
  constructor(settings, inputLayer) {
    super(settings);
    this.inputLayer = inputLayer;
    this.validate();
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height]
    });
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights);
  }
}

function predict(weights) {
  return -weights[this.thread.y][this.thread.x];
}