import Base from './base';
import makeKernel from '../utilities/make-kernel';
import { activate, measure } from '../activation/relu';
import zeros2D from '../utilities/zeros-2d';

export default class Relu extends Base {
  constructor(inputLayer) {
    super();
    this.inputLayer = inputLayer;

    const { width, height } = inputLayer;
    this.width = width;
    this.height = height;
    this.validate();
    this.weights = zeros2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      functions: [activate]
    });

    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height],
      functions: [measure]
    });
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights);
  }

  compare() {
    this.inputLayer.deltas = this.compareKernel(this.weights, this.deltas);
  }
}

export function predict(inputs) {
  return activate(inputs[this.thread.y][this.thread.x]);
}

export function compare(weights, deltas) {
  return measure(weights[this.thread.y][this.thread.x], deltas[this.thread.y][this.thread.x]);
}