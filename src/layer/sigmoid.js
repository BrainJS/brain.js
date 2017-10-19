'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';
import { sigmoid, sigmoidDerivative } from '../activation/sigmoid';

export default class Sigmoid extends Base {
  constructor(inputLayer) {
    super();
    this.width = inputLayer.width;
    this.height = inputLayer.height;
    this.depth = inputLayer.depth;
    this.inputLayer = inputLayer;
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      functions: [sigmoid]
    });

    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height, this.depth],
      map: {
        errors: calcError,
        deltas: sigmoidDerivative
      }
    });

    this.learnKernel = makeKernel(learn, {
      functions: [sigmoidDerivative]
    });
  }

  predict() {
    this.outputs = this.predictKernel(this.inputLayer.outputs);
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
  for(let k = 0; k < this.output.x; k++){
    error += nextDeltas[k] * nextWeights[k][this.thread.x];
  }
  return error;
}