import Base from './base';
import makeKernel from '../utilities/make-kernel'
export default class Weigh extends Base {
  constructor(inputLayers) {
    super();
    this.inputLayers = inputLayers;

    //TODO: make this less sensitive
    this.width = inputLayers[1].width;
    this.height = 1;
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      constants: {
        weighWidth: this.inputLayers[1].width,
        weighHeight: this.inputLayers[1].height
      }
    });
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayers[0].weights, this.inputLayers[1].weights);
  }
}

export function predict(weights1, weights2) {
  let sum = 0;
  for (let y = 0; y < this.constants.weighHeight; y++) {
    for (let x = 0; x < this.constants.weighWidth; x++) {
      sum += weights1[this.thread.y][this.thread.x] * weights2[y][x];
    }
  }
  return sum;
}