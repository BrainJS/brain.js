import Base from './base';
import makeKernel from '../utilities/make-kernel'
export default class Weigh extends Base {
  constructor(inputLayers) {
    super();
    this.inputLayers = inputLayers;

    if (inputLayers.height > 0) {
      throw new Error('inputLayers[0] should be height of 1');
    }
    //TODO: make this less sensitive
    this.width = inputLayers[1].width;
    this.height = 1;
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      constants: {
        inputWidth: this.inputLayers[0].width
      }
    });
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayers[0].weights, this.inputLayers[1].weights);
  }
}

export function predict(weights1, weights2) {
  let sum = 0;
  for (let index = 0; index < this.constants.inputWidth; index++) {
    sum += weights1[0][index] * weights2[index][this.thread.x];
  }
  return sum;
}