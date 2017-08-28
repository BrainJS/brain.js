'use strict';

import BaseLayer from './base';
import makeKernel from '../utilities/make-kernel';

export default class FullyConnectedLayer extends BaseLayer {
  constructor(inputLayer, settings) {
    super(inputLayer, settings);

    this.filterCount = this.inputLayer.width * this.inputLayer.height * this.inputLayer.depth;
    this.learnInputKernel = null;
    this.learnFiltersKernel = null;
    this.learnBiasKernel = null;
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height, this.depth],
      constants: {
        inputDepth: this.inputLayer.depth,
        inputHeight: this.inputLayer.height,
        inputWidth: this.inputLayer.width
      }
    });

    this.learnInputKernel = makeKernel(learnInput, {
      output: [this.width, this.height, this.depth],
      constants: {
        filterCount: this.filterCount
      }
    });

    this.learnFiltersKernel = makeKernel(learnFilters, {
      output: [],

    });

    this.learnBiasKernel = makeKernel(learnBias, {
      output: [this.width]
    });

    this.learnKernel = () => {
      this.learnInputKernel(this.filters, this.deltas);
      this.learnFiltersKernel(this.inputs, this.deltas);
      this.learnBiasKernel(this.biases, this.deltas);
    };
  }
}

function predict(inputs, filters, biases) {
  let sum = 0;
  let filterIndex = 0;
  for (let z = 0; z < this.constants.inputDepth; z++) {
    for (let y = 0; y < this.constants.inputHeight; y++) {
      for (let x = 0; x < this.constants.inputWidth; x++) {
        sum += inputs[z][y][x] * filters[filterIndex];
        filterIndex++;
      }
    }
  }

  return sum + biases[this.thread.x];
}

function learnInput(filters, deltas) {
  const delta = deltas[this.output.x];
  let sum = 0;
  for (let filterIndex = 0; filterIndex < this.constants.filterCount; filterIndex++) {
    sum += filters[filterIndex] * delta;
  }
  return sum;
}

function learnFilters(inputs, deltas) {
  const delta = deltas[this.output.x];
  let sum = 0;
  let filterIndex = 0;
  for (let z = 0; z < this.constants.inputDepth; z++) {
    for (let y = 0; y < this.constants.inputHeight; y++) {
      for (let x = 0; x < this.constants.inputWidth; x++) {
        sum += inputs[z][y][x] * delta;
        filterIndex++;
      }
    }
  }
  return sum;
}

function learnBias(biases, deltas) {
  return biases[this.output.x] * deltas[this.output.x];
}