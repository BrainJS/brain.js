import makeKernel from '../utilities/make-kernel';
import OperatorBase from './operator-base';

export default class Add extends OperatorBase {
  constructor(inputLayers) {
    super();
    this.width = inputLayers[0].width;
    this.height = inputLayers[0].height;

    this.inputLayers = inputLayers;
  }

  validate() {
    if (this.inputLayers[0].width !== this.inputLayers[1].width) {
      throw new Error('Layer width mismatch');
    }

    if (this.inputLayers[0].height !== this.inputLayers[1].height) {
      throw new Error('Layer height mismatch');
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

  learn(previousLayer, nextLayer) {
    this.deltas = nextLayer.deltas;
  }
}

export function predict(inputs1, inputs2) {
  return inputs1[this.thread.y][this.thread.x] + inputs2[this.thread.y][this.thread.x];
}