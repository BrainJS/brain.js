'use strict';

export default class ConvolutionLayer {
  constructor() {}
}

function predict(inputs, filters) {
  const x = (this.thread.x * this.constants.xStride) + -this.constants.xPadding + (this.constants.xPadding * 2);
  const y = (this.thread.y * this.constants.yStride) + -this.constants.yPadding + (this.constants.yPadding * 2);

  // convolve centered at this particular location
  let sum = 0;
  for (let filterY = 0; filterY < this.constants.filterYMax; filterY++) {
    // coordinates in the original input array coordinates
    let inputY = y + filterY;
    for (let filterX = 0; filterX < this.constants.filterXMax; filterX++) {
      let inputX = x + filterX;
      if (inputX >= 0 && inputY < this.constants.inputYMax && inputX >= 0 && inputX < this.constants.inputMax) {
        for (let filterIndex = 0; filterIndex < this.constants.filterCount; filterIndex++) {
          sum += getFilterValue(filters, filterX, filterY, filterIndex) * getInputValue(inputs, inputX, inputY, filterIndex);
        }
      }
    }
  }
  sum += this.constants.biases[this.thread.z];
  return sum;
}

function getFilterValue(filters, x, y, z) {
  return filters[((this.constants.filterXMax * y) + x) * this.constants.filterCount + z]
}

function getInputValue(inputs, x, y, z) {
  return inputs[((this.constants.inputXMax * y) + x) * this.constants.inputDepth + z]
}

function learn(inputs, filters, deltas, filterDeltas) {
  const x = (this.thread.x * this.constants.xStride) + -this.constants.xPadding + (this.constants.xPadding * 2);
  const y = (this.thread.y * this.constants.yStride) + -this.constants.yPadding + (this.constants.yPadding * 2);
  // convolve centered at this particular location
  // gradient from above, from chain rule
  var chain_grad = this.out_act.get_grad(ax,ay,d);
  for (let filterY = 0; filterY < this.constants.filterYMax; filterY++) {
    // coordinates in the original input array coordinates
    let inputY = y + filterY;
    for (let filterX = 0; filterX < this.constants.filterXMax; filterX++) {
      let inputX = x + filterX;
      if (inputX >= 0 && inputY < this.constants.inputYMax && inputX >= 0 && inputX < this.constants.inputMax) {
        for (let filterIndex = 0; filterIndex < this.constants.filterCount; filterIndex++) {
          f.dw[ix2] += getInputValue(inputs, inputX, inputY, filterIndex) * chain_grad;
          V.dw[ix1] += getFilterValue(filters, filterX, filterY, filterIndex) * chain_grad;
        }
      }
    }
  }
  this.biases.dw[d] += chain_grad;
  return this.biases.dw[d];
}