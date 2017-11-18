'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';
import { sigmoid, sigmoidDerivative } from '../activation/sigmoid';
import randos from '../utilities/randos';
import randos2d from '../utilities/randos-2d';
import zeros from '../utilities/zeros';
import zeros2d from '../utilities/zeros-2d';

export default class Sigmoid extends Base {
  constructor(inputLayer) {
    super();
    const width = this.width = inputLayer.width;
    const height = this.height = inputLayer.height;
    this.inputLayer = inputLayer;
    const size = this.width * this.height;
    this.weights = randos2d(width, height);
    this.biases = randos2d(width, height);
    this.errors = zeros2d(width, height);
    this.deltas = zeros(size);
    this.outputs = zeros(size);
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      functions: [sigmoid]
    });

    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height],
      map: {
        errors: calcError,
        deltas: sigmoidDerivative
      },
      constants: { width: this.width }
    });

    this.learnKernel = makeKernel(learn, {
      output: [this.width, this.height],
      functions: [sigmoidDerivative]
    });
  }

  predict() {
    const result = this.predictKernel(this.inputLayer.outputs);
    this.outputs = result;
  }

  compare(previousLayer, nextLayer) {
    const { errors, deltas } = this.compareKernel(this.outputs, nextLayer.weights, nextLayer.deltas);
    this.errors = errors;
    this.deltas = deltas;
  }

  learn() {
    this.deltas = this.learnKernel(this.weights, this.errors);
  }
}

export function predict(inputs) {
  return sigmoid(inputs[this.thread.y][this.thread.x]);
}

function compare(outputs, nextLayerWeights, nextLayerDeltas) {
  let output = outputs[this.thread.x];
  return sigmoidDerivative(output, calcError(nextLayerWeights, nextLayerDeltas));
}

export function learn(weights, errors) {
  return sigmoidDerivative(weights[this.thread.y][this.thread.x], errors[this.thread.y][this.thread.x]);
}

function calcError(nextWeights, nextDeltas) {
  let error = 0;
  for(let k = 0; k < this.constants.width; k++) {
    error += nextDeltas[k] * nextWeights[k][this.thread.x];
  }
  return error;
}