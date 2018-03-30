import makeKernel from '../utilities/make-kernel';
import Base from './base';
import randos2D from "../utilities/randos-2d";
import zeros2D from "../utilities/zeros-2d";

export default class MultiplyElement extends Base {
  constructor(inputLayer1, inputLayer2) {
    super();
    this.inputLayer1 = inputLayer1;
    this.inputLayer2 = inputLayer2;

    this.width = inputLayer1.width;
    this.height = inputLayer1.height;
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

    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height]
    });
  }

  predict() {
    this.weights = this.predictKernel(this.weights, this.inputLayer.weights);
  }

  compare() {
    this.deltas = this.compareKernel(this.weights, this.deltas);
  }
}

function predict(weights, inputLayerWeights) {
  return weights[this.thread.y][this.thread.x] * inputLayerWeights[this.thread.y][this.thread.x];
}

function compare(weights, deltas) {
  return weights[this.thread.y][this.thread.x] * deltas[this.thread.y][this.thread.x];
}