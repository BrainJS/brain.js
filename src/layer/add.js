'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';

export default class Add extends Base {
  constructor(settings, inputLayers) {
    super(settings);

    if (inputLayers[0].width !== inputLayers[1].width) {
      throw new Error('Layer width mismatch');
    }

    if (inputLayers[0].height !== inputLayers[1].height) {
      throw new Error('Layer height mismatch');
    }

    this.width = inputLayers[0].width;
    this.height = inputLayers[0].height;

    this.inputLayers = inputLayers;
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height]
    });
  }

  predict() {
    this.outputs = this.predictKernel(this.inputLayers[0].outputs, this.inputLayers[1].outputs);
  }

  learn() {
    this.deltas = this.nextLayer.deltas;
  }
}

export function predict(inputs1, inputs2) {
  return inputs1[this.thread.y][this.thread.x] + inputs2[this.thread.y][this.thread.x];
}