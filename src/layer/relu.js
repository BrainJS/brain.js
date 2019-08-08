const { Activation } = require('./types');
const { makeKernel } = require('../utilities/kernel');
const { activate, measure } = require('../activation/relu');
const zeros2D = require('../utilities/zeros-2d');
const zeros3D = require('../utilities/zeros-3d');

function predict(inputs) {
  return activate(inputs[this.thread.y][this.thread.x]);
}

function compare(weights, deltas) {
  return measure(
    weights[this.thread.y][this.thread.x],
    deltas[this.thread.y][this.thread.x]
  );
}

function predict3D(inputs) {
  return activate(inputs[this.thread.z][this.thread.y][this.thread.x]);
}

function compare3D(weights, deltas) {
  return measure(
    weights[this.thread.z][this.thread.y][this.thread.x],
    deltas[this.thread.z][this.thread.y][this.thread.x]
  );
}

class Relu extends Activation {
  constructor(inputLayer) {
    super();
    this.inputLayer = inputLayer;

    const { width, height, depth } = inputLayer;
    this.width = width;
    this.height = height;
    this.validate();
    if (depth > 1) {
      this.depth = depth;
      this.weights = zeros3D(width, height, depth);
      this.deltas = zeros3D(width, height, depth);
    } else {
      this.depth = 1;
      this.weights = zeros2D(width, height);
      this.deltas = zeros2D(width, height);
    }
  }

  setupKernels() {
    const { width, height, depth } = this.inputLayer;
    if (this.depth > 1) {
      this.predictKernel = makeKernel(predict3D, {
        output: [width, height, depth],
        functions: [activate],
      });

      this.compareKernel = makeKernel(compare3D, {
        output: [width, height, depth],
        functions: [measure],
      });
    } else {
      this.predictKernel = makeKernel(predict, {
        output: [width, height],
        functions: [activate],
      });

      this.compareKernel = makeKernel(compare, {
        output: [width, height],
        functions: [measure],
      });
    }
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights);
  }

  compare() {
    this.inputLayer.deltas = this.compareKernel(this.weights, this.deltas);
  }
}

function relu(inputLayer) {
  return new Relu(inputLayer);
}

module.exports = { Relu, relu, predict, compare, predict3D, compare3D };
