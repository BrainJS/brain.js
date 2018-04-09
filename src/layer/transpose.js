import { Modifier } from './types';
import makeKernel from '../utilities/make-kernel';

export default class Transpose extends Modifier {
  constructor(inputLayer) {
    super();
    this.inputLayer = inputLayer;
    this.width = this.inputLayer.height;
    this.height = this.inputLayer.width;
    this.validate();
  }

  setupKernels() {
    this.predictKernel = makeKernel(transpose, {
      output: [this.height, this.width]
    });
    this.compareKernel = makeKernel(transpose, {
      output: [this.width, this.height]
    })
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights);
  }

  compare() {
    this.inputLayer.deltas = this.predictKernel(this.deltas);
  }
}

function transpose(array) {
  return array[this.thread.x][this.thread.y];
}