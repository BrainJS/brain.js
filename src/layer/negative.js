import makeKernel from '../utilities/make-kernel';
import Base from './base';

export default class Negative extends Base {
  constructor(settings, inputLayer) {
    super(settings);
    this.inputLayer = inputLayer;
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