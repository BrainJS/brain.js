'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';

export default class Output extends Base {
  setupKernels() {
    this.predictKernel = makeKernel();
    this.learnKernel = makeKernel();
  }

  predict() {
    this.outputs = this.previousLayer.outputs;
  }

  learn() {
    this.learnKernel = makeKernel(function(outputs, target) {
      const output = outputs[this.thread.x];
      return calcDeltas(calcError(output, target), output);
    });
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