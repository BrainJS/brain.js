import OperatorBase from './operator-base';
import makeKernel from '../utilities/make-kernel'
import zeros2D from '../utilities/zeros-2d';
import randos2D from '../utilities/randos-2d';

export default class Weigh extends OperatorBase {
  constructor(inputLayers) {
    super();
    this.inputLayers = inputLayers;

    if (inputLayers.height > 0) {
      throw new Error('inputLayers[0] should be height of 1');
    }
    //TODO: make this less sensitive
    this.width = inputLayers[1].width;
    this.height = 1;
    this.deltas = zeros2D(this.width, this.height);
    this.weights = randos2D(this.width, this.height);
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

  learn(previousLayer, nextLayer, learningRate) {
    this.deltas = nextLayer.deltas;
  }
}

export function predict(weights1, weights2) {
  let sum = 0;
  for (let index = 0; index < this.constants.inputWidth; index++) {
    sum += weights1[0][index] * weights2[index][this.thread.x];
  }
  return sum;
}