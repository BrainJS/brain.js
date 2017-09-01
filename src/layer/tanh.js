'use strict';

import BaseLayer from './base';
import makeKernel from '../utilities/make-kernel';
import tanh from '../activation/tanh';

export default class Tanh extends BaseLayer {
  setupKernels() {
    this.predictKernel = makeKernel(function(inputs) {
      return Math.tanh(inputs[this.thread.y][this.thread.x]);
    });

    this.learnKernel = makeKernel(function(weights, deltas) {
      return sigmoidDerivative(weights[this.thread.y][this.thread.x], deltas[this.thread.y][this.thread.x]);
    }, {
      functions: [tanh.derivative]
    });
  }

  predict() {
    this.outputs = this.predictKernel(this.inputs);
  }

  learn() {
    this.learnKernel(this.weights, this.deltas);
  }
}