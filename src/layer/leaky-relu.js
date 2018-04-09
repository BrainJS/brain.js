import { Activation } from './types';
import makeKernel from '../utilities/make-kernel';
import { activate, measure } from '../activation/leaky-relu';

export default class LeakyRelu extends Activation {
  constructor(inputLayer) {
    super();
    this.inputLayer = inputLayer;
    const { width, height, depth } = inputLayer;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.validate();
  }
  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      functions: [activate]
    });

    this.learnKernel = makeKernel(learn, {
      functions: [measure]
    });
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights);
  }

  compare() {
    this.deltas = this.learnKernel(this.weights, this.deltas);
  }
}

export function predict(inputs) {
  return activate(inputs[this.thread.y][this.thread.x]);
}

export function learn(weights, deltas) {
  return measure(weights[this.thread.y][this.thread.x], deltas[this.thread.y][this.thread.x]);
}