const { Activation } = require('./types');
const { makeKernel } = require('../utilities/kernel');
const { activate, measure } = require('../activation/tanh');
const zeros2D = require('../utilities/zeros-2d');
const zeros3D = require('../utilities/zeros-3d');

function predict2D(inputs) {
  return activate(inputs[this.thread.y][this.thread.x]);
}

function predict3D(inputs) {
  return activate(inputs[this.thread.z][this.thread.y][this.thread.x]);
}

function compare2D(weights, errors) {
  return measure(
    weights[this.thread.y][this.thread.x],
    errors[this.thread.y][this.thread.x]
  );
}

function compare3D(weights, errors) {
  return measure(
    weights[this.thread.z][this.thread.y][this.thread.x],
    errors[this.thread.z][this.thread.y][this.thread.x]
  );
}

class Tanh extends Activation {
  constructor(inputLayer) {
    super();
    this.inputLayer = inputLayer;

    const { width, height, depth } = this.inputLayer;
    this.predictKernel = null;
    this.compareKernel = null;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.validate();

    if (this.depth > 0) {
      this.weights = zeros3D(this.width, this.height, this.depth);
      this.deltas = zeros3D(this.width, this.height, this.depth);
    } else {
      this.weights = zeros2D(this.width, this.height);
      this.deltas = zeros2D(this.width, this.height);
    }
  }

  setupKernels() {
    if (this.depth > 0) {
      this.predictKernel = makeKernel(predict3D, {
        output: [this.width, this.height, this.depth],
        functions: [activate]
      });

      this.compareKernel = makeKernel(compare3D, {
        output: [this.width, this.height, this.depth],
        functions: [measure],
      });
    } else {
      this.predictKernel = makeKernel(predict2D, {
        output: [this.width, this.height],
        functions: [activate]
      });

      this.compareKernel = makeKernel(compare2D, {
        output: [this.width, this.height],
        functions: [measure],
      });
    }
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights);
  }

  compare() {
    this.deltas = this.compareKernel(this.weights, this.deltas);
  }
}

function tanh(inputLayer) {
  return new Tanh(inputLayer);
}

module.exports = { Tanh, tanh, predict2D, predict3D, compare2D, compare3D };
