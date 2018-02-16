import Base from './base';
import makeKernel from '../utilities/make-kernel';
import { relu, reluDerivative } from '../activation/relu';
import zeros2D from '../utilities/zeros-2d';

export default class Relu extends Base {
  constructor(inputLayer) {
    const { width, height } = inputLayer;
    super({ width, height });
    this.inputLayer = inputLayer;
    this.weights = zeros2D(width, height);
    this.deltas = zeros2D(width, height);
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      functions: [relu]
    });

    this.learnKernel = makeKernel(learn, {
      output: [this.width, this.height],
      functions: [reluDerivative]
    });
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights);
  }

  compare() {
    this.inputLayer.deltas = this.learnKernel(this.weights, this.deltas);
  }
}

export function predict(inputs) {
  return relu(inputs[this.thread.y][this.thread.x]);
}

export function learn(weights, deltas) {
  return reluDerivative(weights[this.thread.y][this.thread.x], deltas[this.thread.y][this.thread.x]);
}