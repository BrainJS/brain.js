'use strict';

import BaseLayer from './base';
import makeKernel from '../utilities/make-kernel';
import leakyRelu from '../activation/leaky-relu';

export default class LeakyReluLayer extends BaseLayer {
  setupKernels() {
    this.predictKernel = makeKernel(function(inputs) {
      return activate(inputs[this.thread.y][this.thread.x]);
    }, {
      functions: [leakyRelu.activate]
    });

    this.learnKernel = makeKernel(function(weights, deltas) {
      return sigmoidDerivative(weights[this.thread.y][this.thread.x], deltas[this.thread.y][this.thread.x]);
    }, {
      functions: [leakyRelu.derivative]
    });
  }

  predict() {
    this.outputs = this.predictKernel(this.inputs);
  }

  learn() {
    this.learnKernel(this.weights, this.deltas);
  }
}