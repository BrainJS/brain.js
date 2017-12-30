import makeKernel from '../utilities/make-kernel';
import OperatorBase from './operator-base';

export default class Multiply extends OperatorBase {
  constructor(inputLayers) {
    super();

    if (inputLayers[0].width !== inputLayers[1].height) {
      throw new Error('Layer size mismatch');
    }
    this.inputLayers = inputLayers;
    this.width = inputLayers[0].width;
    this.height = inputLayers[1].height;
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height]
    });
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer[0].weights, this.inputLayer[1].weights);
  }

  learn(previousLayer, nextLayer) {
    this.deltas = nextLayer.deltas;
  }
}

export function predict(inputs1, inputs2) {
  let sum = 0;
  for(let i = 0; i < this.output.x; i++) {
    sum += inputs1[this.thread.y][i] * inputs2[i][this.thread.x];
  }
  return sum;
}