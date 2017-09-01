'use strict';

export function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

export function sigmoidDerivative(weights, deltas) {
  let mwi = weights[this.thread.y][this.thread.x];
  return mwi * (1 - mwi) * deltas[this.thread.y][this.thread.x];
}

export default {
  activate: sigmoid,
  compare: sigmoidDerivative
};