'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';
import randos from '../utilities/randos';
import randos2d from '../utilities/randos-2d';
import zeros from '../utilities/zeros';
import zeros2d from '../utilities/zeros-2d';

export default class MultiplyWeights extends Base {
  constructor(settings, inputLayer) {
    super(settings);
    const width = this.width = inputLayer.width;
    const height = this.height = inputLayer.height;
    this.inputLayer = inputLayer;
    const size = width * height;
    this.weights = randos2d(width, height);
    this.biases = randos(this.width);
    this.errors = zeros(size);
    this.deltas = zeros(size);
    this.outputs = zeros(size);
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
    const result = this.predictKernel(this.inputLayer.outputs, this.weights);
    this.outputs = result;
  }

  compare() {}

  learn() {
    this.deltas = this.learnKernel(this.inputLayer.outputs, this.deltas);
  }
}

export function predict(inputs, weights) {
  debugger;

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

