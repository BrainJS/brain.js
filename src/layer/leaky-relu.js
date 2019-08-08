const { Activation } = require('./types');
const { makeKernel } = require('../utilities/kernel');
const lra = require('../activation/leaky-relu');
const activate = lra.activate;
const measure = lra.measure;

function predict(inputs) {
  return activate(inputs[this.thread.y][this.thread.x]);
}

function compare(weights, deltas) {
  return measure(
    weights[this.thread.y][this.thread.x],
    deltas[this.thread.y][this.thread.x]
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
    this.predictKernel = makeKernel(predict, {
      functions: [activate],
    });

    this.compareKernel = makeKernel(compare, {
      functions: [measure],
    });
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

module.exports = { LeakyRelu, leakyRelu, predict, compare };
