import makeKernel from '../utilities/make-kernel';
import zeros2D from '../utilities/zeros-2d';
import Base from './base';

export default class Target extends Base {
  constructor(settings, inputLayer) {
    super(settings);
    this.compareKernelOutput = null;
    this.inputLayer = inputLayer;
    // TODO: properly handle dimensions
    this.width = inputLayer.width;
    this.height = inputLayer.height;
    this.weights = zeros2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
    this.errors = zeros2D(this.width, this.height);
  }

  validate() {
    super.validate();
    if (this.width !== this.inputLayer.width) {
      throw new Error(`Layer width mismatch of ${this.inputLayer1.width} and ${this.inputLayer2.width}`);
    }
    if (this.height !== this.inputLayer.height) {
      throw new Error(`Layer width mismatch of ${this.inputLayer1.height} and ${this.inputLayer2.height}`);
    }
  }

  setupKernels() {
    const compareFn = this.height === 1
      ? compare1D
      : compare2D;
    this.compareKernel = makeKernel(compareFn, {
      output: [this.width, this.height]
    });
    this.compareKernelOutput = makeKernel(compareOutput, {
      output: [this.inputLayer.width, this.inputLayer.height],
      constants: {
        size: this.height
      }
    });
  }

  predict() {
    // NOTE: this looks like it shouldn't be, but the weights are immutable, and this is where they are reused.
    this.weights = this.inputLayer.weights;
  }

  compare(targetValues) {
    // this is where weights attach to deltas
    // deltas will be zero on learn, so save it in error for comparing to mse later
    this.deltas = this.errors = this.compareKernel(this.weights, targetValues);
    this.inputLayer.deltas = this.compareKernelOutput(this.weights, this.deltas);
  }
}

function compare1D(weights, targetValues) {
  return weights[this.thread.y][this.thread.x] - targetValues[this.thread.x];
}

function compare2D(weights, targetValues) {
  return weights[this.thread.y][this.thread.x] - targetValues[this.thread.y][this.thread.x];
}

function compareOutput(outputWeights, outputDeltas) {
  let sum = 0;
  for (let i = 0; i < this.constants.size; i++) {
    sum += outputWeights[i][this.thread.x] * outputDeltas[i][this.thread.x];
  }
  return sum;
}