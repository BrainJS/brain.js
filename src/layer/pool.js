import { Filter } from './types';
import { makeKernel } from '../utilities/kernel';
import { setPadding } from '../utilities/layer-setup';
import zeros2D from '../utilities/zeros-2d';

export default class Pool extends Filter {
  static get defaults() {
    return {
      padding: 0,
      bias: 0,
      filterWidth: 0,
      filterHeight: 0
    };
  }

  constructor(settings, inputLayer) {
    super(settings);
    this.inputLayer = inputLayer;

    setPadding(this, settings);

    this.switchX = null;
    this.switchY = null;
    this.validate();
    this.weights = zeros2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height, this.depth],
      map: {
        switchX: setSwitchX,
        switchY: setSwitchY
      },
      constants: {
        inputWidth: this.inputLayer.width,
        inputHeight: this.inputLayer.height,
        paddingX: this.paddingX,
        paddingY: this.paddingY,
        filterHeight: this.filterHeight,
        filterWidth: this.filterWidth
      }
    });

    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height, this.depth],
      constants: {
        outputWidth: this.width,
        outputHeight: this.height,
        paddingX: this.paddingX,
        paddingY: this.paddingY
      }
    });
  }

  predict() {
    const weights = this.predictKernel(this.inputLayer.weights);
    this.switchX = weights.switchX;
    this.switchY = weights.switchY;
    return this.weights = weights.result;
  }

  compare() {
    this.inputLayer.deltas = this.compareKernel(this.deltas, this.switchX, this.switchY);
  }
}

export function predict(inputs) {
  const x = ((this.thread.x / this.output.x) * this.constants.inputWidth) - this.constants.paddingX;
  const y = ((this.thread.y / this.output.y) * this.constants.inputHeight) - this.constants.paddingY;
  let largestValue = -Infinity;
  let largestX = -1;
  let largestY = -1;

  // convolve centered at this particular location
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
        const input = inputs[this.output.z][inputY][inputX];
        if (input > largestValue) {
          largestValue = input;
          largestY = inputY;
          largestX = inputX;
        }
      }
    }
  }
  setSwitchY(largestY);
  setSwitchX(largestX);
  return largestValue;
}

function setSwitchY(value) {
  return value;
}

function setSwitchX(value) {
  return value;
}

export function compare(deltas, switchY, switchX) {
  const x = Math.floor(((this.thread.x / this.output.x) * this.constants.outputWidth) - this.constants.paddingX);
  const y = Math.floor(((this.thread.y / this.output.y) * this.constants.outputHeight) - this.constants.paddingY);
  const deltaXIndex = switchX[y][x];
  const deltaYIndex = switchY[y][x];

  if (deltaXIndex !== this.thread.y) return 0;
  if (deltaYIndex !== this.thread.x) return 0;

  return deltas[y][x];
}
