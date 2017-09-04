'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';

export default class FullyConnected extends Base {
  constructor(inputLayer, settings) {
    super(inputLayer, settings);

    this.width = this.inputLayer.width * this.inputLayer.height * this.inputLayer.depth;
    this.learnInputKernel = null;
    this.learnFiltersKernel = null;
    this.learnBiasKernel = null;
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width],
      constants: {
        inputDepth: this.inputLayer.depth,
        inputHeight: this.inputLayer.height,
        inputWidth: this.inputLayer.width
      }
    });

    this.learnInputKernel = makeKernel(learnInput, {
      output: [this.width]
    });

    this.learnFiltersKernel = makeKernel(learnFilters, {
      output: [],

    });

    this.learnBiasesKernel = makeKernel(learnBiases, {
      output: [this.width]
    });

    this.learnKernel = () => {
      this.learnInputKernel(this.filters, this.deltas);
      this.learnFiltersKernel(this.inputs, this.deltas);
      this.learnBiasKernel(this.biases, this.deltas);
    };
  }

  predict() {
    this.outputs = this.predictKernel(this.inputs, this.filters, this.biases);
  }

  learn() {
    this.filterDeltas = this.learnFilters(this.inputLayer, this.deltas);
    this.biases = this.learnBiasesKernel(this.bias, this.deltas);
    this.deltas = this.learnInputs(this.filters);
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

function learnBiases(biases, deltas) {
  return biases[this.output.x] * deltas[this.output.x];
}