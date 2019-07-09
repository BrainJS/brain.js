const Activation = require('./types').Activation;
const makeKernel = require('../utilities/kernel').makeKernel;
const sigmoid = require('../activation/sigmoid');
const { activate, measure } = sigmoid;
const zeros2D = require('../utilities/zeros-2d');

function predict(inputs) {
  return activate(inputs[this.thread.y][this.thread.x]);
}

function compare(weights, deltas) {
  const weight = weights[this.thread.y][this.thread.x];
  const delta = deltas[this.thread.y][this.thread.x];
  return measure(weight, delta);
}

class Sigmoid extends Activation {
  constructor(inputLayer) {
    super();
    this.inputLayer = inputLayer;

    const { width, height } = inputLayer;
    this.width = width;
    this.height = height;
    this.validate();
    this.weights = zeros2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      functions: [activate],
    });

    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height],
      functions: [measure],
    });
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights);
  }

  compare() {
    this.inputLayer.deltas = this.compareKernel(this.weights, this.deltas);
  }
}

module.exports = { Sigmoid, predict, compare };
