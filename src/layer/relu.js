'use strict';

import BaseLayer from './base';
import makeKernel from '../utilities/make-kernel';
import relu from '../activation/relu';

export default class ReluLayer extends BaseLayer {
  setupKernels() {
    this.predictKernel = makeKernel(function(inputs) {
      return activate(inputs[this.thread.y][this.thread.x]);
    }, {
      functions: [relu.activate]
    });

    this.learnKernel = makeKernel(function(weights, deltas) {
      return derivative(weights[this.thread.y][this.thread.x], deltas[this.thread.y][this.thread.x]);
    }, {
      functions: [relu.derivative]
    });
  }

  predict() {
    this.outputs = this.predictKernel(this.inputs);
  }

  learn() {
    this.learnKernel(this.weights, this.deltas);
  }
}