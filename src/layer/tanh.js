import Base from './base';
import makeKernel from '../utilities/make-kernel';
import { tanh, tanhDerivative } from '../activation/tanh';

export default class Tanh extends Base {
  constructor(inputLayer) {
    super();
    this.inputLayer = inputLayer;

    const { width, height, depth } = this.inputLayer;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.validate();
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict);

    this.learnKernel = makeKernel(learn, {
      functions: [tanhDerivative]
    });
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights);
  }

  compare() {
    this.deltas = this.learnKernel(this.weights, this.errors);
  }
}

export function predict(inputs) {
  return Math.tanh(inputs[this.thread.y][this.thread.x]);
}

export function learn(weights, errors) {
  return tanhDerivative(weights[this.thread.y][this.thread.x], errors[this.thread.y][this.thread.x]);
}