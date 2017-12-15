'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';
import { relu, reluDerivative } from '../activation/relu';

export default class Relu extends Base {
  constructor(inputLayer) {
    super();
    this.width = inputLayer.width;
    this.height = inputLayer.height;
    this.depth = inputLayer.depth;
    this.inputLayer = inputLayer;
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      functions: [relu]
    });

    this.learnKernel = makeKernel(learn, {
      functions: [reluDerivative]
    });
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights);
  }

  learn() {
    this.deltas = this.learnKernel(this.weights, this.errors);
  }
}

export function predict(inputs) {
  return relu(inputs[this.thread.y][this.thread.x]);
}

export function learn(weights, errors) {
  return reluDerivative(weights[this.thread.y][this.thread.x], errors[this.thread.y][this.thread.x]);
}