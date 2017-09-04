'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';

export default class Pool extends Base {
  constructor(inputLayer, settings) {
    super(inputLayer, settings);
    this.strideX = null;
    this.strideY = null;
    this.paddingX = null;
    this.paddingY = null;
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

function predict(inputs) {
  const x = (((100 / (this.output.x / this.thread.x)) / 100) * this.constants.inputWidth) - this.constants.paddingX;
  const y = (((100 / (this.output.y / this.thread.y)) / 100) * this.constants.inputHeight) - this.constants.paddingY;
  let largestValue = -99999; // hopefully small enough ;\
  let largestX =- 1;
  let largestY =-1;

  // convolve centered at this particular location
  for (let filterY = 0; filterY < this.constants.filterHeight; filterY++) {
    // coordinates in the original input array coordinates
    let inputY = y + filterY;
    for (let filterX = 0; filterX < this.constants.filterWidth; filterX++) {
      let inputX = x + filterX;
      if (inputX >= 0 && inputY < this.constants.inputHeight && inputX >= 0 && inputX < this.constants.inputWidth) {
        for (let filterIndex = 0; filterIndex < this.constants.filterCount; filterIndex++) {
          const input = inputs[this.thread.z][this.thread.y][this.thread.x];
          if (input > largestValue) {
            largestValue = input;
            largestX = inputX;
            largestY = inputY;
          }
        }
      }
    }
  }
  setSwitchX(largestX);
  setSwitchY(largestY);
  return largestValue;
}

function setSwitchX(value) {
  return value;
}

function setSwitchY(value) {
  return value;
}

function learn(inputs, deltas) {
  const inputX = this.switchX[this.thread.z][this.thread.y][this.thread.x];
  const inputY = this.switchY[this.thread.z][this.thread.y][this.thread.x];
  const input = inputs[this.thread.x][inputY][inputX];
  const delta = deltas[this.thread.z][this.thread.y][this.thread.x];
  return input * delta;
}