import { Activation } from './types';
import { makeKernel } from '../utilities/kernel';
import { tanhDerivative } from '../activation/tanh';
import zeros2D from '../utilities/zeros-2d';

export function predict(inputs) {
  return Math.tanh(inputs[this.thread.y][this.thread.x]);
}

export function compare(weights, errors) {
  return tanhDerivative(
    weights[this.thread.y][this.thread.x],
    errors[this.thread.y][this.thread.x]
  );
}

export default class Tanh extends Activation {
  constructor(inputLayer) {
    super();
    this.inputLayer = inputLayer;

    const { width, height, depth } = this.inputLayer;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.validate();
    this.weights = zeros2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
    });

    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height],
      functions: [tanhDerivative],
    });
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights);
  }

  compare() {
    this.deltas = this.compareKernel(this.weights, this.deltas);
  }
}
