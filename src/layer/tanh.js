'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';
import { tanh, tanhDerivative } from '../activation/tanh';

export default class Tanh extends Base {
  constructor(inputLayer, settings) {
    super(settings);
    this.inputLayer = inputLayer;
    inputLayer.setNextLayer(this);
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict);

    this.learnKernel = makeKernel(learn, {
      functions: [tanhDerivative]
    });
  }

  predict() {
    this.outputs = this.predictKernel(this.inputLayer.outputs);
  }

  learn() {
    this.deltas = this.learnKernel(this.weights, this.errors);
  }
}

export function predict(inputs) {
  return Math.tanh(inputs[this.thread.y][this.thread.x]);
}

export function learn(weights, errors) {
  return tanhDerivative(weights[this.thread.y][this.thread.x], errors[this.thread.y][this.thread.x]);
}