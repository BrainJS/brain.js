'use strict';

export function leakyReLU(weights) {
  const weight = weights[this.thread.y][this.thread.x];
  return weight > 0 ? weight : 0.01 * weight;
}

export function leakyReLUDerivative(weights, deltas) {
  const delta = deltas[this.thread.y][this.thread.x];
  const weight = weights[this.thread.y][this.thread.x];
  return weight > 0 ? delta : 0.01 * delta;
}

export default {
  activate: leakyReLU,
  compare: leakyReLUDerivative
};