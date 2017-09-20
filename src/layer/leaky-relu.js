'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';
import { leakyRelu, leakyReluDerivative } from '../activation/leaky-relu';

export default class LeakyRelu extends Base {
  constructor(inputLayer) {
    super();
    this.width = inputLayer.width;
    this.height = inputLayer.height;
    this.depth = inputLayer.depth;
    this.inputLayer = inputLayer;
  }
  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      functions: [leakyRelu]
    });

    this.learnKernel = makeKernel(learn, {
      functions: [leakyReluDerivative]
    });
  }

  predict() {
    this.outputs = this.predictKernel(this.inputLayer.outputs);
  }

  learn() {
    this.deltas = this.learnKernel(this.weights, this.deltas);
  }
}

export function predict(inputs) {
  return leakyRelu(inputs[this.thread.y][this.thread.x]);
}

export function learn(weights, deltas) {
  return leakyReluDerivative(weights[this.thread.y][this.thread.x], deltas[this.thread.y][this.thread.x]);
}