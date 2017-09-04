'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';
import { activate, derivative } from '../activation/sigmoid';

export default class Sigmoid extends Base {
  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      functions: [activate]
    });

    this.learnKernel = makeKernel(learn, {
      functions: [derivative]
    });
  }

  predict() {
    this.outputs = this.predictKernel(this.inputs);
  }

  learn() {
    this.learnKernel(this.weights, this.deltas);
  }
}

export function predict(inputs) {
  return activate(inputs[this.thread.y][this.thread.x]);
}

export function learn(weights, deltas) {
  return derivative(weights[this.thread.y][this.thread.x], deltas[this.thread.y][this.thread.x]);
}