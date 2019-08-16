const { Activation } = require('./types');
const { makeKernel } = require('../utilities/kernel');
const { activate, measure } = require('../activation/leaky-relu');

function predict2D(inputs) {
  return activate(inputs[this.thread.y][this.thread.x]);
}

function predict3D(inputs) {
  return activate(inputs[this.thread.z][this.thread.y][this.thread.x]);
}

function compare2D(weights, deltas) {
  return measure(
    weights[this.thread.y][this.thread.x],
    deltas[this.thread.y][this.thread.x]
  );
}

function compare3D(weights, deltas) {
  return measure(
    weights[this.thread.z][this.thread.y][this.thread.x],
    deltas[this.thread.z][this.thread.y][this.thread.x]
  );
}

class LeakyRelu extends Activation {
  constructor(inputLayer) {
    super();
    this.inputLayer = inputLayer;
    const { width, height, depth } = inputLayer;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.validate();
  }

  setupKernels() {
    if (this.depth > 0) {
      this.predictKernel = makeKernel(predict3D, {
        functions: [activate],
      });

      this.compareKernel = makeKernel(compare3D, {
        functions: [measure],
      });
    } else {
      this.predictKernel = makeKernel(predict2D, {
        functions: [activate],
      });

      this.compareKernel = makeKernel(compare2D, {
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

function leakyRelu(inputLayer) {
  return new LeakyRelu(inputLayer);
}

module.exports = { LeakyRelu, leakyRelu, predict2D, predict3D, compare2D, compare3D };
