import { Filter } from './types';

export default class SoftMax extends Filter {
  constructor(settings, inputLayer) {
    super(settings);
    this.inputLayer = inputLayer;
    this.validate();
  }
}

function getMaxInput(inputs) {
  let maxInput = -Infinity;
  for (let z = 0; z < this.constants.inputDepth; z++) {
    for (let y = 0; y < this.constants.inputHeight; y++) {
      for (let x = 0; x < this.constants.inputWidth; x++) {
        const input = inputs[z][y][x];
        if (input > maxInput) {
          maxInput = input;
        }
      }
    }
  }
  return maxInput;
}

function getExponentialSum(inputs, maxInput) {
  let exponentialSum = 0;
  for (let z = 0; z < this.constants.inputDepth; z++) {
    for (let y = 0; y < this.constants.inputHeight; y++) {
      for (let x = 0; x < this.constants.inputWidth; x++) {
        exponentialSum += Math.exp(inputs[z][y][x] - maxInput);
      }
    }
  }
  return exponentialSum;
}

function getExponential(inputs, maxInput) {
  return Math.exp(inputs[this.thread.z][this.thread.y][this.thread.x] - maxInput);
}

function predict(exponentials, exponentialSum) {
  return exponentials[this.thread.z][this.thread.y][this.thread.x] /= exponentialSum;
}

function learn(target, exponentials) {
  const indicator = this.thread.x === target ? 1 : 0;
  return -(indicator - exponentials[target]);
}

//TODO: handle: `return -Math.log(this.es[y]);` in learn