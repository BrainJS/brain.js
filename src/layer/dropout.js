import Base from './base';
import makeKernel from '../utilities/make-kernel';

export default class Dropout extends Base {
  static get defaults() {
    return {
      width: 0,
      height: 0,
      depth: 0,
      probability: 0.5,
      isTraining: false
    };
  };

  constructor(settings, inputLayer) {
    super(settings);
    this.inputLayer = inputLayer;
  }

  setupKernels() {
    if (this.isTraining) {
      this.predictKernel = makeKernel(trainingPredict, {
        output: [this.width, this.height, this.depth]
      });
    } else {
      this.predictKernel = makeKernel(predict, {
        output: [this.width, this.height, this.depth]
      });
    }
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights);
  }

  learn() {
    this.deltas = this.learnKernel(this.deltas);
  }
}

//TODO: implement random in glsl in gpu.js
export function trainingPredict(inputs) {
  if (Math.random() < this.constants.probability) {
    return 0;
  } else {
    return inputs[this.thread.y][this.thread.x];
  }
}

export function predict(inputs) {
  return inputs[this.thread.y][this.thread.x] * this.constants.probability;
}
