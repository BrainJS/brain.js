'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';

export default class Multiply extends Base {
  constructor(inputLayers) {
    super();

    if (inputLayers[0].width !== inputLayers[1].height) {
      throw new Error('Layer size mismatch');
    }
    this.inputLayers = inputLayers;
    this.width = inputLayers[0].width;
    this.height = inputLayers[1].height;
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height]
    });
  }

  predict() {
    this.outputs = this.predictKernel(this.inputLayer[0].outputs, this.inputLayer[1].outputs);
  }

  learn(previousLayer, nextLayer) {
    this.deltas = nextLayer.deltas;
  }
}

export function predict(inputs1, inputs2) {
  let sum = 0;
  for(let i = 0; i < this.output.x; i++) {
    sum += inputs1[this.thread.y][i] * inputs2[i][this.thread.x];
  }
  return sum;
}