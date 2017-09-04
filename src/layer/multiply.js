'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';

export default class Multiply extends Base {
  constructor(inputLayer, settings) {
    super(inputLayer, settings);

    if (inputLayer.width !== this.height) {
      throw new Error('Layer size mismatch');
    }
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
    this.outputs = this.predictKernel(this.weights, this.inputs);
  }

  learn() {
    this.deltas = this.learnKernel(this.inputs, this.deltas);
  }
}

export function predict(weights, inputs) {
  let sum = 0;
  for(let i = 0; i < this.output.x; i++) {
    sum += weights[this.thread.y][i] * inputs[i][this.thread.x];
  }
  return sum;
}

export function learn(inputs, deltas) {
  const delta = deltas[this.thread.y][this.thread.x];
  let sum = 0;
  for(let i = 0; i < this.output.x; i++) {
    sum += inputs[this.thread.y][i] * delta;
  }
  return sum;
}

