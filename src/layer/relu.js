'use strict';

import BaseLayer from './base';
import makeKernel from '../utilities/make-kernel';

export default class ReluLayer extends BaseLayer {
  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height]
    });

    this.learnKernel = makeKernel(learn, {
      output: [this.width, this.height]
    });
  }
}

function predict(weights) {
  return Math.max(0, weights[this.thread.y][this.thread.x]);
}

function learn(weights, deltas) {
  return weights[this.thread.y][this.thread.x] > 0 ? deltas[this.thread.y][this.thread.x] : 0;
}