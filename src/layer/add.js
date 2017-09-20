'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';

export default class Add extends Base {
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
  }

  predict() {
    this.outputs = this.predictKernel(this.inputLayer1.outputs, this.inputLayer2.outputs);
  }

  learn() {
    this.deltas = this.nextLayer.deltas;
  }
}

export function predict(inputs1, inputs2) {
  return inputs1[this.thread.y][this.thread.x] + inputs2[this.thread.y][this.thread.x];
}