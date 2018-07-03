import Base from './base';
import { makeKernel } from '../utilities/kernel';
import { setStride, setPadding } from '../utilities/layer-setup';
export default class Convolution extends Base {
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

  constructor(settings, inputLayer) {
    super(settings);

    this.stride = null;
    this.strideX = null;
    this.strideY = null;
    setStride(this, settings);

    this.padding = null;
    this.paddingX = null;
    this.paddingY = null;
    setPadding(this, settings);

    this.filterCount = settings.filterCount;
    this.filterWidth = settings.filterWidth;
    this.filterHeight = settings.filterHeight;

    this.width = Math.floor((inputLayer.width + (this.paddingX * 2) - this.filterWidth) / this.strideX + 1);
    this.height = Math.floor((inputLayer.height + (this.paddingY * 2) - this.filterHeight) / this.strideY + 1);
    this.depth = this.filterCount;

    this.bias = settings.bias;

    this.filters = null;
    this.filterDeltas = null;

    this.learnFilters = null;
    this.learnInputs = null;
    this.inputLayer = inputLayer;
    this.validate();
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

    this.compareInputsKernel = makeKernel(compareInputs, {
      output: [this.inputLayer.width, this.inputLayer.height, this.inputLayer.depth]
    });
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights, this.filters, this.biases);
  }

  compare() {
    this.deltas = this.compareKernel(this.inputLayer.weights, this.deltas);
    this.inputLayer.deltas = this.compareInputsKernel(this.filters, this.inputLayer.deltas);
  }
}

export function predict(inputs, filters, biases) {
  const x = (((this.thread.x / this.output.x) * this.constants.inputWidth) * this.constants.strideX) - this.constants.paddingX;
  const y = (((this.thread.y / this.output.y) * this.constants.inputHeight) * this.constants.strideY) - this.constants.paddingY;

  // convolve centered at this particular location
  let sum = 0;
  for (let filterY = 0; filterY < this.constants.filterHeight; filterY++) {
    // coordinates in the original input array coordinates
    let inputY = filterY + y;
    for (let filterX = 0; filterX < this.constants.filterWidth; filterX++) {
      let inputX = filterX + x;
      if (
        inputY >= 0
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

export function compare(inputs, deltas) {
  let sum = 0;
  let delta = deltas[this.thread.z][this.thread.y * this.constants.paddingY][this.thread.x * this.constants.paddingX];
  let inputXMax = this.constants.inputWidth + this.constants.paddingX;
  let inputYMax = this.constants.inputHeight + this.constants.paddingY;
  for (let inputY = this.thread.y - this.constants.paddingY; inputY < inputYMax; inputY += this.constants.strideY) {
    for (let inputX = this.thread.x - this.constants.paddingX; inputX < inputXMax; inputX += this.constants.strideX) {
      if (
        inputY >= 0
        && inputY < this.constants.inputHeight
        && inputX >= 0
        && inputX < this.constants.inputWidth
      ) {
        for (let inputIndex = 0; inputIndex < this.constants.inputDepth; inputIndex++) {
          sum += inputs[inputIndex][inputY][inputX] * delta;
        }
      }
    }
  }
  return sum;
}

export function compareInputs(filters, deltas) {
  let sum = 0;
  for (let filterY = 0; filterY <= this.thread.y; filterY++) {
    let offsetY = this.thread.y - filterY;
    for (let filterX = 0; filterX <= this.thread.x; filterX++) {
      let offsetX = this.thread.x - filterX;
      for (let filterIndex = 0; filterIndex < this.constants.filterCount; filterIndex++) {
        sum += filters[filterIndex][offsetY][offsetX] * deltas[filterIndex][filterY][filterX];
      }
      offsetX--;
    }
    offsetY--;
  }
  return sum;
}