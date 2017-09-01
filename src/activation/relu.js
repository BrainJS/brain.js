'use strict';

function reLU(weights) {
  return Math.max(0, weights[this.thread.y][this.thread.x]);
}

function reLUDerivative(weights, deltas) {
  return weights[this.thread.y][this.thread.x] > 0 ? deltas[this.thread.y][this.thread.x] : 0;
}

export default {
  activate: reLU,
  compare: reLUDerivative
};