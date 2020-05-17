const { makeKernel, release, clone, clear } = require('../utilities/kernel');
const zeros = require('../utilities/zeros');
const zeros2D = require('../utilities/zeros-2d');
// const zeros3D = require('../utilities/zeros-3d');
const { Filter } = require('./types');

function compare1D(weights, targetValues) {
  // return targetValues[this.thread.x] - weights[this.thread.y][this.thread.x];
  return weights[this.thread.y][this.thread.x] - targetValues[this.thread.x];
}

function compare2D(weights, targetValues) {
  // return targetValues[this.thread.y][this.thread.x] - weights[this.thread.y][this.thread.x];
  return (
    weights[this.thread.y][this.thread.x] -
    targetValues[this.thread.y][this.thread.x]
  );
}

class Target extends Filter {
  constructor(settings, inputLayer) {
    super(settings);
    this.inputLayer = inputLayer;
    this.width = inputLayer.width;
    this.height = inputLayer.height;
    this.depth = inputLayer.depth;
    this.validate();
    if (this.depth) {
      throw new Error('Target layer not implemented for depth');
    } else if (this.height) {
      this.weights = zeros2D(this.width, this.height);
      this.deltas = zeros2D(this.width, this.height);
      this.errors = zeros2D(this.width, this.height);
    } else {
      this.weights = zeros(this.width);
      this.deltas = zeros(this.width);
      this.errors = zeros(this.width);
    }
  }

  setupKernels() {
    const compareFn = this.width === 1 ? compare1D : compare2D;
    this.compareKernel = makeKernel(compareFn, {
      output: [this.width, this.height],
      immutable: true,
    });
  }

  predict() {
    // TODO: should we clone here?
    // NOTE: this looks like it shouldn't be, but the weights are immutable, and this is where they are reused.
    release(this.weights);
    this.weights = clone(this.inputLayer.weights);
    clear(this.deltas);
  }

  compare(targetValues) {
    // this is where weights attach to deltas
    // deltas will be zero on learn, so save it in error for comparing to mse later
    release(this.deltas);
    release(this.errors);
    release(this.inputLayer.deltas);
    this.deltas = this.compareKernel(this.weights, targetValues);
    this.inputLayer.deltas = clone(this.deltas);
    this.errors = clone(this.deltas);
  }

  setupPraxis() {}
}

function target(settings, inputLayer) {
  return new Target(settings, inputLayer);
}

module.exports = {
  Target,
  target,
};
