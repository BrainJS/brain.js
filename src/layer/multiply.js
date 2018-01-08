import makeKernel from '../utilities/make-kernel';
import Base from './base';

export default class Multiply extends Base {
  constructor(inputLayers, settings) {
    super(settings);
    this.inputLayers = inputLayers;
    this.width = inputLayers[0].width;
    this.height = inputLayers[1].height;
    this.compareKernel0 = null;
    this.compareKernel1 = null;
  }

  validate() {
    if (this.inputLayers[0].width !== this.inputLayers[1].height) {
      throw new Error('Layer size mismatch');
    }
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height]
    });
    this.compareKernel0 = makeKernel();
    this.compareKernel1 = makeKernel();
  }

  compare() {
    this.inputLayers[0].deltas = null;
    this.inputLayers[1].deltas = null;
    // const backPropagateValue = product.deltas[rightRowBase + rightColumn];
    // left.deltas[leftRow] += right.weights[rightRow] * backPropagateValue;
    // right.deltas[rightRow] += left.weights[leftRow] * backPropagateValue;
  }
}

export function predict(inputs1, inputs2) {
  let sum = 0;
  for(let i = 0; i < this.output.x; i++) {
    sum += inputs1[this.thread.y][i] * inputs2[i][this.thread.x];
  }
  return sum;
}

export function compare(deltas, inputs1, inputs2) {
  let sum = 0;
  for(let i = 0; i < this.output.x; i++) {
    sum += inputs1[this.thread.y][i] * inputs2[i][this.thread.x];
  }
  return sum;
}