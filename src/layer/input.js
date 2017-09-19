'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';

export default class Input extends Base {
  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height, this.depth]
    });

    this.learnKernel = () => {};
  }

  predict(inputs) {
    this.weights = this.predictKernel(inputs);
  }
}

function predict(inputs) {
  return inputs[this.thread.z][this.thread.y][this.thread.x];
}