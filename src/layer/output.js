'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';
import randos from '../utilities/randos';

export default class Output extends Base {
  constructor(settings, inputLayer) {
    super(settings);
    this.inputLayer = inputLayer;
    const size = this.width * this.height * this.depth;
    this.weights = [randos(size)];
  }

  setupKernels() {
    this.compareKernel = makeKernel(compare, {
      map: {
        deltas: setDelta,
        errors: setError
      },
      output: [this.width, this.height]
    });
  }

  predict() {
    this.outputs = this.inputLayer.outputs;
  }

  compare(previousLayer) {
    const { errors, deltas } = this.compareKernel(previousLayer.outputs, this.outputs);
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

function compare(target, outputs) {
  const output = outputs[this.thread.x];
  const error = target[this.thread.x] - output;
  setDelta(error * output);
  return setError(error);
}