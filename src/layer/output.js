import Base from './base';
import makeKernel from '../utilities/make-kernel';
import randos2D from "../utilities/randos-2d";
import zeros2D from "../utilities/zeros-2d";

export default class Output extends Base {
  constructor(settings, inputLayer) {
    super(settings);
    this.inputLayer = inputLayer;
    this.weights = randos2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);

    if (this.height === 1) {
      //this.predict = this.predict1D;
      this.compare = this.compare1D;
    }
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
    // this is where weights attach to deltas
    this.deltas = this.inputLayer.weights;
  }

  predict1D() {
    // this is where weights attach to deltas
    this.deltas = this.inputLayer.weights[0];
  }

  compare(target) {
    const { errors, deltas } = this.compareKernel(target, this.weights);
    this.errors = errors;
    this.deltas = deltas;
  }

  compare1D(target) {
    const { errors, deltas } = this.compareKernel(target, this.weights);
    this.errors = [errors];
    this.deltas = [deltas];
  }

  learn(previousLayer, nextLayer, learningRate) {}
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