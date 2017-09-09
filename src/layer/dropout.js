'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';

export default class Dropout extends Base {
  static get defaults() {
    return {
      width: 0,
      height: 0,
      depth: 0,
      probability: 0.5,
      isTraining: false
    };
  };

  constructor(inputLayer, settings) {
    super(inputLayer, settings);
  }

  setupKernels() {
    if (this.isTraining) {
      this.predictKernel = makeKernel(trainingPredict, {
        output: [this.width, this.height, this.depth]
      });
    } else {
      this.predictKernel = makeKernel(predict, {
        output: [this.width, this.height, this.depth]
      });
    }

    this.learnKernel = makeKernel(learn, {
      output: [this.width, this.height, this.depth]
    });
  }

  predict() {
    this.outputs = this.predictKernel(this.inputs);
  }

  learn() {
    this.deltas = this.learnKernel(this.deltas);
  }
}

export function trainingPredict(inputs) {
  if (Math.random() < this.constants.probability) {
    return 0;
  } else {
    return inputs[this.thread.z][this.thread.y][this.thread.x];
  }
}

export function predict(inputs) {
  return inputs[this.thread.z][this.thread.y][this.thread.x] * this.constants.probability;
}

//is this actually doing... anything???
export function learn(deltas) {
  const delta = deltas[this.thread.z][this.thread.y][this.thread.x];
  if(delta !== 0) {
    return delta;
  } else {
    return 0;
  }
}