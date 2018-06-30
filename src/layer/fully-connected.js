import Base from './base';
import makeKernel from '../utilities/make-kernel';

export default class FullyConnected extends Base {
  constructor(settings, inputLayer) {
    super(settings);

    if (this.inputLayer.depth !== 1) {
      //TODO: make go away and handle 3d, should be fairly easy
      throw new Error('depth of 1 only supported at this time');
    }

    this.inputLayer = inputLayer;
    this.learnInputsKernel = null;
    this.learnFiltersKernel = null;
    this.learnBiasKernel = null;

    const { width, height, depth } = inputLayer;
    this.width = width * height * depth;
    this.validate();
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

    this.learnInputsKernel = makeKernel(learnInputs, {
      output: [this.width],
      constants: {
        inputDepth: this.inputLayer.depth,
        inputHeight: this.inputLayer.height,
        inputWidth: this.inputLayer.width
      }
    });

    this.learnFiltersKernel = makeKernel(learnFilters, {
      output: [this.width],
      constants: {
        inputDepth: this.inputLayer.depth,
        inputHeight: this.inputLayer.height,
        inputWidth: this.inputLayer.width
      }
    });

    this.learnBiasesKernel = makeKernel(learnBiases, {
      output: [this.width],
      constants: {
        inputDepth: this.inputLayer.depth,
        inputHeight: this.inputLayer.height,
        inputWidth: this.inputLayer.width
      }
    });

    this.learnKernel = () => {
      this.learnInputsKernel(this.filters, this.deltas);
      this.learnFiltersKernel(this.inputLayer.outputs, this.deltas);
      this.learnBiasKernel(this.biases, this.deltas);
    };
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights, this.filters, this.biases);
  }

  compare() {
    this.filterDeltas = this.learnFilters(this.inputLayer, this.deltas);
    this.biases = this.learnBiasesKernel(this.bias, this.deltas);
    this.deltas = this.learnInputs(this.filters);
  }
}

export function predict(inputs, filters, biases) {
  let output = 0;
  for (let y = 0; y < this.constants.inputHeight; y++) {
    for (let x = 0; x < this.constants.inputWidth; x++) {
      output += inputs[y][x] * filters[y][x];
    }
  }
  return output + biases[this.thread.x];
}

export function learnInputs(filters, weights) {
  let filterDelta = 0;
  for (let y = 0; y < this.constants.inputWidth; y++) {
    filterDelta += filters[this.thread.x][y] * weights[this.thread.x];
  }
  return filterDelta;
}

export function learnFilters(inputs, weights) {
  //0 here should probably be depth
  return inputs[0][this.thread.y] * weights[this.thread.x];
}

export function learnBiases(biases, deltas) {
  return biases[this.output.x] * deltas[this.output.x];
}