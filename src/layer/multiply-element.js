import makeKernel from '../utilities/make-kernel';
import Base from './base';
import randos2D from "../utilities/randos-2d";
import zeros2D from "../utilities/zeros-2d";

export default class MultiplyElement extends Base {
  constructor(inputLayer1, inputLayer2) {
    super();

    if (inputLayer1.width !== inputLayer2.width) {
      throw new Error('Layer width mismatch');
    }

    if (inputLayer1.height !== inputLayer2.height) {
      throw new Error('Layer height mismatch');
    }

    this.width = inputLayer1.width;
    this.height = inputLayer1.height;
    this.inputLayer1 = inputLayer1;
    this.inputLayer2 = inputLayer2;
    this.deltas = zeros2D(this.width, this.height);
    this.weights = randos2D(this.width, this.height);
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
    this.deltas = zeros2D(this.width, this.height);
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