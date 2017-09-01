'use strict';

export function tanH(weights) {
  return Math.tanh(weights[this.thread.y][this.thread.x]);
}

// grad for z = tanh(x) is (1 - z^2)
export function tanHDerivative(weights, deltas) {
  let mwi = weights[this.thread.y][this.thread.x];
  return  (1 - mwi * mwi) * deltas[this.thread.y][this.thread.x];
}

export default {
  activate: tanH,
  compare: tanHDerivative
};