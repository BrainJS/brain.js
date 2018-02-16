import makeKernel from '../utilities/make-kernel';
import Base from './base';
import zeros2D from "../utilities/zeros-2d";
import randos2D from "../utilities/randos-2d";

export default class Multiply extends Base {
  constructor(inputLayer1, inputLayer2) {
    super();
    this.inputLayer1 = inputLayer1;
    this.inputLayer2 = inputLayer2;
    this.width = inputLayer2.width;
    this.height = inputLayer1.height;
    this.compareKernel1 = null;
    this.compareKernel2 = null;
    this.weights = zeros2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
  }

  validate() {
    super.validate();
    if (this.inputLayer1.width !== this.inputLayer2.height) {
      throw new Error(`Layer width mismatch of ${this.inputLayer1.width} and ${this.inputLayer2.height}`);
    }
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      constants: {
        size: this.inputLayer2.height
      }
    });
    this.compareKernel1 = makeKernel(compareFromX, {
      output: [this.inputLayer1.width, this.inputLayer1.height],
      constants: {
        size: this.inputLayer2.width
      }
    });
    this.compareKernel2 = makeKernel(compareFromY, {
      output: [this.inputLayer2.width, this.inputLayer2.height],
      constants: {
        size: this.inputLayer1.height
      }
    });
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer1.weights, this.inputLayer2.weights);
  }

  compare() {
    const newDeltas1 = this.compareKernel1(this.deltas, this.inputLayer1.deltas, this.inputLayer2.weights);
    const newDeltas2 = this.compareKernel2(this.deltas, this.inputLayer2.deltas, this.inputLayer1.weights);
    this.inputLayer1.deltas = newDeltas1;
    this.inputLayer2.deltas = newDeltas2;
  }
}

export function predict(weights1, weights2) {
  let sum = 0;
  for(let i = 0; i < this.constants.size; i++) {
    sum += weights1[this.thread.y][i] * weights2[i][this.thread.x];
  }
  return sum;
}

export function compareFromX(deltas, inputDeltas, inputWeights) {
  let sum = inputDeltas[this.thread.y][this.thread.x];
  for(let i = 0; i < this.constants.size; i++) {
    sum += deltas[this.thread.y][i] * inputWeights[this.thread.x][i];
  }
  return sum;
}

export function compareFromY(deltas, inputDeltas, inputWeights) {
  let sum = inputDeltas[this.thread.y][this.thread.x];
  for(let i = 0; i < this.constants.size; i++) {
    sum += deltas[i][this.thread.x] * inputWeights[i][this.thread.y];
  }
  return sum;
}