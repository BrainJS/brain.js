'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';
import { setPadding, setStride } from "../utilities/layer-setup"
export default class Pool extends Base {
  static get defaults() {
    return {
      stride: 0,
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
    setStride(this, settings);

    this.switchX = null;
    this.switchY = null;
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height, this.depth],
      map: {
        switchX: setSwitchX,
        switchY: setSwitchY
      }
    });

    this.learnKernel = makeKernel(learn, {
      output: [this.width, this.height, this.depth]
    });
  }

  predict() {
    const outputs = this.predictKernel(this.inputLayer);
    this.switchX = outputs.switchX;
    this.switchY = outputs.switchY;
    return this.outputs = outputs;
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

export function learn(deltas, switchY, switchX) {
  const x = Math.floor(((this.thread.x / this.output.x) * this.constants.outputWidth) - this.constants.paddingX);
  const y = Math.floor(((this.thread.y / this.output.y) * this.constants.outputHeight) - this.constants.paddingY);
  const deltaXIndex = switchX[y][x];
  const deltaYIndex = switchY[y][x];

  if (deltaXIndex !== this.thread.y) return 0;
  if (deltaYIndex !== this.thread.x) return 0;

  return deltas[y][x];
}
