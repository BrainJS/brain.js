import makeKernel from '../utilities/make-kernel';
import Base from './base';
import zeros2D from '../utilities/zeros-2d';
import randos2D from '../utilities/randos-2d';

export default class Add extends Base {
  constructor(inputLayers, settings) {
    super(settings);
    this.width = inputLayers[0].width;
    this.height = inputLayers[0].height;
    this.inputLayers = inputLayers;
    this.deltas = zeros2D(this.width, this.height);
    this.weights = randos2D(this.width, this.height);
  }

  validate() {
    if (this.inputLayers[0].width !== this.inputLayers[1].width) {
      throw new Error(`Layer width mismatch of ${this.inputLayers[0].width} and ${this.inputLayers[1].width}`);
    }

    if (this.inputLayers[0].height !== this.inputLayers[1].height) {
      throw new Error(`Layer height mismatch of ${this.inputLayers[0].height} and ${this.inputLayers[1].height}`);
    }
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height]
    });
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayers[0].weights, this.inputLayers[1].weights);
  }

  compare(previousLayer, nextLayer, learningRate) {
    this.inputLayers[0].deltas = this.deltas;
    this.inputLayers[1].deltas = this.deltas;
  }
}

export function predict(inputs1, inputs2) {
  return inputs1[this.thread.y][this.thread.x] + inputs2[this.thread.y][this.thread.x];
}