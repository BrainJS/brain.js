import Base from './base';
import makeKernel from '../utilities/make-kernel';
import { activate, measure } from '../activation/sigmoid';
import randos2D from '../utilities/randos-2d';
import zeros2D from '../utilities/zeros-2d';

export default class Sigmoid extends Base {
  constructor(inputLayer) {
    const { width, height} = inputLayer;
    super({ width, height });
    this.inputLayer = inputLayer;
    this.weights = randos2D(width, height);
    this.deltas = zeros2D(width, height);
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      functions: [activate]
    });

    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height],
      functions: [measure],
      constants: { width: this.width }
    });
  }

  predict() {
    const weights = this.predictKernel(this.inputLayer.weights);
    this.weights = weights;
  }

  compare(previousLayer, nextLayer) {
    const deltas = this.compareKernel(this.weights, this.deltas);
    this.inputLayer.deltas = deltas;
  }
}

export function predict(inputs) {
  return activate(inputs[this.thread.y][this.thread.x]);
}

function compare(weights, deltas) {
  let weight = weights[this.thread.y][this.thread.x];
  let delta = deltas[this.thread.y][this.thread.x];
  return measure(weight, delta);
}