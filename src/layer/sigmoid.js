'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';
import { activate, measure } from '../activation/sigmoid';
import randos from '../utilities/randos';
import randos2d from '../utilities/randos-2d';
import zeros from '../utilities/zeros';
import zeros2d from '../utilities/zeros-2d';

export default class Sigmoid extends Base {
  constructor(inputLayer) {
    const { width, height} = inputLayer;
    super({ width, height });
    this.inputLayer = inputLayer;
    this.weights = randos2d(width, height);
    this.deltas = zeros(width);
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      functions: [activate]
    });

    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height],
      map: {
        errors: calcError,
        deltas: measure
      },
      constants: { width: this.width }
    });

    this.learnKernel = makeKernel(learn, {
      output: [this.width, this.height],
      functions: [measure]
    });
  }

  predict() {
    const result = this.predictKernel(this.inputLayer.weights);
    this.weights = result;
  }

  compare(previousLayer, nextLayer) {
    const { errors, deltas } = this.compareKernel(this.weights, nextLayer.weights, nextLayer.deltas);
    this.errors = errors;
    this.deltas = deltas;
  }

  learn() {
    this.deltas = this.learnKernel(this.weights, this.errors);
  }
}

export function predict(inputs) {
  return activate(inputs[this.thread.y][this.thread.x]);
}

function compare(weights, nextLayerWeights, nextLayerDeltas) {
  let weight = weights[this.thread.x];
  return measure(weight, calcError(nextLayerWeights, nextLayerDeltas));
}

export function learn(weights, errors) {
  return measure(weights[this.thread.y][this.thread.x], errors[this.thread.y][this.thread.x]);
}

function calcError(nextWeights, nextDeltas) {
  let error = 0;
  for(let k = 0; k < this.constants.width; k++) {
    debugger;
    error += nextDeltas[k] * nextWeights[k][this.thread.x];
  }
  return error;
}