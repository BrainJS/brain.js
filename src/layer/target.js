const { makeKernel } = require('../utilities/kernel');
const zeros = require('../utilities/zeros');
const zeros2D = require('../utilities/zeros-2d');
const zeros3D = require('../utilities/zeros-3d');
const { Filter } = require('./types');

function compare1D(weights, targetValues) {
  // return targetValues[this.thread.x] - weights[this.thread.y][this.thread.x];
  return weights[this.thread.y][this.thread.x] - targetValues[this.thread.x];
}

function compare2D(weights, targetValues) {
  // return targetValues[this.thread.y][this.thread.x] - weights[this.thread.y][this.thread.x];
  return weights[this.thread.y][this.thread.x] - targetValues[this.thread.y][this.thread.x];
}

class Target extends Filter {
  constructor(settings, inputLayer) {
    super(settings);
    this.inputLayer = inputLayer;
    this.width = inputLayer.width;
    this.height = inputLayer.height;
    this.depth = inputLayer.depth;
    this.validate();
    if (this.depth > 0) {
      throw new Error('Target layer not implemented for depth');
    } else if (this.height > 1) {
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
      output: [this.width, this.height]
    });
  }

  predict() {
    // NOTE: this looks like it shouldn't be, but the weights are immutable, and this is where they are reused.
    this.weights = this.inputLayer.weights;
  }

  compare(targetValues) {
    // this is where weights attach to deltas
    // deltas will be zero on learn, so save it in error for comparing to mse later
    this.errors = this.compareKernel(this.weights, targetValues);
    this.deltas = this.errors;
    this.inputLayer.deltas = this.deltas;
  }
}

function target(settings, inputLayer) {
  return new Target(settings, inputLayer);
}

module.exports = {
  Target,
  target
};
