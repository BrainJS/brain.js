import Base from './base';
import makeKernel from '../utilities/make-kernel';
import randos from '../utilities/randos';

export default class Output extends Base {
  constructor(settings, inputLayer) {
    super(settings);
    this.inputLayer = inputLayer;
    this.weights = randos(this.width);
  }

  setupKernels() {
    this.compareKernel = makeKernel(compare, {
      map: {
        deltas: setDelta,
        errors: setError
      },
      output: [this.width]
    });
  }

  predict() {
    this.weights = this.inputLayer.weights;
  }

  compare(target) {
    const { errors, deltas } = this.compareKernel(target, this.weights);
    this.errors = errors;
    this.deltas = deltas;
  }

  learn(target) {}
}

function setDelta(delta) {
  return delta;
}

function setError(error) {
  return error;
}

function compare(target, weights) {
  const weight = weights[this.thread.x];
  const error = target[this.thread.x] - weight;
  setDelta(error * weight);
  return setError(error);
}