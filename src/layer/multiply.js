import makeKernel from '../utilities/make-kernel';
import OperatorBase from './operator-base';

export default class Multiply extends OperatorBase {
  constructor(inputLayers) {
    super();
    this.inputLayers = inputLayers;
    this.width = inputLayers[0].width;
    this.height = inputLayers[1].height;
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
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer[0].weights, this.inputLayer[1].weights);
  }

  learn(previousLayer, nextLayer, learningRate) {
    this.deltas = nextLayer.deltas;
    this.inputLayers[0].deltas = this.deltas;
    this.inputLayers[1].deltas = this.deltas;
  }
}

export function predict(inputs1, inputs2) {
  let sum = 0;
  for(let i = 0; i < this.output.x; i++) {
    sum += inputs1[this.thread.y][i] * inputs2[i][this.thread.x];
  }
  return sum;
}