import makeKernel from '../utilities/make-kernel';
import Base from './base';
import zeros2D from '../utilities/zeros-2d';

export default class Add extends Base {
  constructor(inputLayer1, inputLayer2) {
    super();
    this.width = inputLayer1.width;
    this.height = inputLayer1.height;
    this.inputLayer1 = inputLayer1;
    this.inputLayer2 = inputLayer2;
    this.weights = zeros2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
  }

  validate() {
    super.validate();
    if (this.inputLayer1.width !== this.inputLayer2.width) {
      throw new Error(`Layer width mismatch of ${this.inputLayer1.width} and ${this.inputLayer2.width}`);
    }

    if (this.inputLayer1.height !== this.inputLayer2.height) {
      throw new Error(`Layer height mismatch of ${this.inputLayer1.height} and ${this.inputLayer2.height}`);
    }
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height]
    });
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer1.weights, this.inputLayer2.weights);
  }

  compare(previousLayer, nextLayer, learningRate) {
    this.inputLayer1.deltas = this.deltas;
    this.inputLayer2.deltas = this.deltas;
  }
}

export function predict(inputWeights1, inputWeights2) {
  return inputWeights1[this.thread.y][this.thread.x] + inputWeights2[this.thread.y][this.thread.x];
}