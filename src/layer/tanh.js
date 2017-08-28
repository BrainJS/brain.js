'use strict';

import BaseLayer from './base';
import makeKernel from '../utilities/make-kernel';

export default class TanhLayer extends BaseLayer {
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
  return Math.tanh(weights[this.thread.y][this.thread.x]);
}

function learn(weights, deltas) {
  // grad for z = tanh(x) is (1 - z^2)
  let mwi = weights[this.thread.y][this.thread.x];
  return  (1 - mwi * mwi) * deltas[this.thread.y][this.thread.x];
}