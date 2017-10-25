'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';

export default class Output extends Base {
  constructor(settings, inputLayer) {
    super(settings);
    this.inputLayer = inputLayer;
  }

  setupKernels() {
    this.compareKernel = makeKernel(function() {

    }, {
      output: [this.inputLayer.width, this.inputLayer.height]
    });
    this.learnKernel = makeKernel(function(outputs, target) {
      const output = outputs[this.thread.x];
      return calcDeltas(calcError(output, target), output);
    }, {
      output: [this.inputLayer.width, this.inputLayer.height]
    });
  }

  predict() {
    this.outputs = this.inputLayer.outputs;
  }

  compare() {

  }

  learn() {

  }
}

function calcDeltas(error, output) {
  return error * output * (1 - output);
}

function calcError(weights, deltas) {
  let error = 0;
  for(let k = 0; k < this.output.x; k++){
    error += deltas[k] * weights[k][this.thread.x];
  }
  return error;
}