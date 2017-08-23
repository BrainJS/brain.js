'use strict';

import BaseLayer from './base';
import makeKernel from '../utilities/make-kernel';

export default class ConvolutionLayer extends BaseLayer {
  static get defaults() {
    return {
      stride: 0,
      padding: 0,
      bias: 0,
      filterCount: 1,
      filterWidth: 0,
      filterHeight: 0
    };
  }

  constructor(inputLayer, settings) {
    super(inputLayer, settings);

    this.strideX = null;
    this.strideY = null;
    this.setupStride(settings);

    this.paddingX = null;
    this.paddingY = null;
    this.setupPadding(settings);

    this.filterCount = settings.filterCount;
    this.filterWidth = settings.filterWidth;
    this.filterHeight = settings.filterHeight;

    if (this.width !== undefined) throw new Error('ConvolutionLayer.width is calculated dynamically');
    if (this.height !== undefined) throw new Error('ConvolutionLayer.height is calculated dynamically');

    this.width = Math.floor((inputLayer.width + (this.paddingX * 2) - this.filterWidth) / this.strideX + 1);
    this.height = Math.floor((inputLayer.height + (this.paddingY * 2) - this.filterHeight) / this.strideY + 1);
    this.depth = this.filterCount;

    this.bias = settings.bias;

    this.filters = null;
    this.filterDeltas = null;

    this.learnFilters = null;
    this.learnInputs = null;
  }

  setupStride(settings) {
    const defaults = ConvolutionLayer.defaults;
    if (settings.hasOwnProperty('stride')) {
      this.strideX = settings.stride;
      this.strideY = settings.stride;
    } else {
      if (settings.hasOwnProperty('strideX')) {
        this.strideX = settings.strideX;
      } else {
        this.strideX = defaults.stride;
      }

      if (settings.hasOwnProperty('strideY')) {
        this.strideY = settings.strideY;
      } else {
        this.strideY = defaults.stride;
      }
    }
  }

  setupPadding(settings) {
    const defaults = ConvolutionLayer.defaults;
    if (settings.hasOwnProperty('padding')) {
      this.paddingX = settings.padding;
      this.paddingY = settings.padding;
    } else {
      if (settings.hasOwnProperty('paddingX')) {
        this.paddingX = settings.paddingX;
      } else {
        this.paddingX = defaults.padding;
      }

      if (settings.hasOwnProperty('paddingY')) {
        this.paddingY = settings.paddingY;
      } else {
        this.paddingY = defaults.padding;
      }
    }
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      constants: {
        inputWidth: this.inputLayer.width,
        inputHeight: this.inputLayer.height,
        inputDepth: this.inputLayer.depth,
        strideX: this.strideX,
        strideY: this.strideY,
        paddingX: this.paddingX,
        paddingY: this.paddingY,
        filterCount: this.filterCount,
        filterWidth: this.filterWidth,
        filterHeight: this.filterHeight
      },
      output: [this.width, this.height, this.depth]
    });

    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height, this.depth]
    });

    this.learnFilters = makeKernel(learnFilters, {
      output: [this.filterWidth, this.filterHeight, this.filterCount]
    });
    this.learnInputs = makeKernel(learnInputs, {
      output: [this.inputLayer.width, this.inputLayer.height, this.inputLayer.depth]
    });
  }

  predict() {
    this.predictKernel();
  }

  learn() {
    this.filterDeltas = this.learnFilters(this.inputLayer, this.deltas);
    this.deltas = this.learnInputs(this.filters);
  }
}

function predict(inputs, filters, biases) {
  const x = ((this.thread.x * this.constants.strideX) - this.constants.paddingX) + this.thread.x;
  const y = ((this.thread.y * this.constants.strideY) - this.constants.paddingY) + this.thread.y;

  // convolve centered at this particular location
  let sum = 0;
  for (let filterY = 0; filterY < this.constants.filterHeight; filterY++) {
    // coordinates in the original input array coordinates
    let inputY = y + filterY;
    for (let filterX = 0; filterX < this.constants.filterWidth; filterX++) {
      let inputX = x + this.thread.x + filterX;
      if (
        inputX >= 0
        && inputY < this.constants.inputHeight
        && inputX >= 0
        && inputX < this.constants.inputWidth
      ) {
        for (let inputIndex = 0; inputIndex < this.constants.inputDepth; inputIndex++) {
          for (let filterIndex = 0; filterIndex < this.constants.filterCount; filterIndex++) {
            sum += filters[filterIndex][filterY][filterX] * inputs[inputIndex][inputY][inputX];
          }
        }
      }
    }
  }
  return sum + biases[this.thread.z];
}

function learnFilters(inputs, outputDeltas) {
  let sum = 0;
  let inputXMax = this.constants.inputWidth + this.constants.paddingX;
  let inputYMax = this.constants.inputHeight + this.constants.paddingY;
  for (let inputY = -this.constants.paddingY; inputY < inputYMax; inputY += this.constants.strideY) {
    for (let inputX = -this.constants.paddingX; inputX < inputXMax; inputX += this.constants.strideX) {
      for (let inputIndex = 0; inputIndex < this.constants.inputDepth; inputIndex++) {
        sum += inputs[inputIndex][inputY][inputX];
      }
    }
  }
  return sum + outputDeltas[this.thread.z][this.thread.y * this.constants.paddingY][this.thread.x * this.constants.paddingX];
}

function learnInputs(filters) {
  let filterX = this.thread.x - this.constants.strideX;
  let filterY = this.thread.y = this.constants.strideY;
  let sum = 0;
  for (let filterIndex = 0; filterIndex < this.constants.filterCount; filterIndex++) {
    for (; filterY < this.constants.strideY; filterY++) {
      for (; filterX < this.constants.strideX; filterX++) {
        sum += filters[filterIndex][filterY][filterX];
      }
    }
  }
  return sum;
}