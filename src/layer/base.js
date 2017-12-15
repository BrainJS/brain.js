'use strict';

export default class Base {
  static get defaults() {
    return {
      width: 1,
      height: 1,
      depth: 1,
      weights: null,
      errors: null,
      deltas: null,
      changes: null
    }
  };

  constructor(settings = {}) {
    //size
    this.width = null;
    this.height = null;
    this.depth = null;

    //methods
    this.predictKernel = null;
    this.compareKernel = null;
    this.learnKernel = null;

    //what matters :P
    this.errors = null;
    this.deltas = null;
    this.weights = null;

    const defaults = this.constructor.defaults;
    for (let p in defaults) {
      if (!defaults.hasOwnProperty(p)) continue;
      this[p] = settings.hasOwnProperty(p)
        ? settings[p]
        : defaults[p];
    }
  }

  validate() {}

  setupKernels() {}

  predict() {}

  compare(previousLayer, nextLayer) {}

  learn() {}

  toArray() {
    return this.weights.toArray();
  }
}

function learn(weights, deltas, previousMomentums) {
  let delta = deltas[this.thread.y][this.thread.x];
  let weight = weights[this.thread.y][this.thread.x];
  let previousMomentum = previousMomentums[this.thread.y][this.thread.x];
  const maxDelta = this.constants.maxDelta;
  // rmsprop adaptive learning rate
  const momentum = setMomentum(previousMomentum * this.constants.decayRate + (1 - this.constants.decayRate) * delta * delta);
  // gradient clip
  if (delta > maxDelta) {
    setDelta(maxDelta);
    setNumClipped(numClipped + 1);
  } else if (delta < -maxDelta) {
    setDelta(-maxDelta);
    setNumClipped(numClipped + 1);
  } else {
    setNumClipped(numClipped);
  }
  return weight + -this.constants.learningRate * deltas / Math.sqrt(momentum + this.constants.smoothEps) - regc * weight;
}

function setNumClipped(number) {
  return number;
}

function setDelta(delta) {
  return delta;
}

function setMomentum(momentum) {
  return momentum;
}