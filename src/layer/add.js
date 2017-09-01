'use strict';

import BaseLayer from './base';
import makeKernel from '../utilities/make-kernel';

export default class AddLayer extends BaseLayer {
  constructor(inputLayer, settings) {
    super(inputLayer, settings);

    if (inputLayer.width !== this.width) {
      throw new Error('Layer width mismatch');
    }

    if (inputLayer.height !== this.height) {
      throw new Error('Layer height mismatch');
    }
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height]
    });
  }

  predict() {
    this.outputs = this.predictKernel(this.weights, this.inputs);
  }

  learn() {
    this.deltas = this.nextLayer.deltas;
  }
}

function predict(weights, inputs) {
  return weights[this.thread.y][this.thread.x] + inputs[this.thread.y][this.thread.x];
}