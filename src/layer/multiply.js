'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';

export default class Multiply extends Base {
  constructor(inputLayer1, inputLayer2, settings) {
    super(settings);

    if (inputLayer1.width !== inputLayer2.height) {
      throw new Error('Layer size mismatch');
    }

    this.inputLayer1 = inputLayer1;
    this.inputLayer2 = inputLayer2;
    this.width = inputLayer1.width;
    this.height = inputLayer2.height;
    inputLayer1.setNextLayer(this);
    inputLayer2.setNextLayer(this);
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
  let sum = 0;
  for(let i = 0; i < this.output.x; i++) {
    sum += inputs1[this.thread.y][i] * inputs2[i][this.thread.x];
  }
  return sum;
}