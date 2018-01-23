import makeKernel from '../utilities/make-kernel';
import Base from './base';

export default class Multiply extends Base {
  constructor(inputLayers, settings) {
    super(settings);
    this.inputLayers = inputLayers;
    this.width = inputLayers[1].width;
    this.height = inputLayers[0].height;
    this.compareKernel0 = null;
    this.compareKernel1 = null;
  }

  validate() {
    if (this.inputLayers[0].width !== this.inputLayers[1].height) {
      throw new Error(`Layer width mismatch of ${this.inputLayers[0].width} and ${this.inputLayers[1].height}`);
    }
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      constants: {
        size: this.inputLayers[1].height
      }
    });
    this.compareKernel0 = makeKernel(compareFromX, {
      output: [this.inputLayers[0].width, this.inputLayers[0].height],
      constants: {
        size: this.inputLayers[1].width
      }
    });
    this.compareKernel1 = makeKernel(compareFromY, {
      output: [this.inputLayers[1].width, this.inputLayers[1].height],
      constants: {
        size: this.inputLayers[0].height
      }
    });
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayers[0].weights, this.inputLayers[1].weights);
  }

  compare() {
    const newDeltas0 = this.compareKernel0(this.deltas, this.inputLayers[0].deltas, this.inputLayers[1].weights);
    const newDeltas1 = this.compareKernel1(this.deltas, this.inputLayers[1].deltas, this.inputLayers[0].weights);
    this.inputLayers[0].deltas = newDeltas0;
    this.inputLayers[1].deltas = newDeltas1;
  }
}

export function predict(weights1, weights2) {
  let sum = 0;
  for(let i = 0; i < this.constants.size; i++) {
    sum += weights1[this.thread.y][i] * weights2[i][this.thread.x];
  }
  if (isNaN(sum)) {
    debugger;
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