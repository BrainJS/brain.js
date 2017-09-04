'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';
import { derivative } from '../activation/tanh';

export default class Tanh extends Base {
  setupKernels() {
    this.predictKernel = makeKernel(function(inputs) {
      return Math.tanh(inputs[this.thread.y][this.thread.x]);
    });

    this.learnKernel = makeKernel(function(weights, deltas) {
      return derivative(weights[this.thread.y][this.thread.x], deltas[this.thread.y][this.thread.x]);
    }, {
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