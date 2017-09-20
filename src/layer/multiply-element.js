'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';

export default class MultiplyElement extends Base {
  constructor(settings, inputLayer1, inputLayer2) {
    super(settings);

    if (inputLayer1.width !== inputLayer2.width) {
      throw new Error('Layer width mismatch');
    }

    if (inputLayer1.height !== inputLayer2.height) {
      throw new Error('Layer height mismatch');
    }

    this.width = inputLayer1.width;
    this.height = inputLayer1.height;

    this.inputLayer1 = inputLayer1;
    this.inputLayer2 = inputLayer2;
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height]
    });

    this.learnKernel = makeKernel(learn, {
      output: [this.width, this.height]
    });
  }

  predict() {
    this.outputs = this.predictKernel(this.weights, this.inputLayer.output);
  }

  learn() {
    this.deltas = this.predictKernel(this.weights, this.deltas);
  }
}

function predict(weights, inputs) {
  return weights[this.thread.y][this.thread.x] * inputs[this.thread.y][this.thread.x];
}

function learn(weights, deltas) {
  return weights[this.thread.y][this.thread.x] * deltas[this.thread.y][this.thread.x];
}