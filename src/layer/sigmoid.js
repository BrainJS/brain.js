const { Activation } = require('./types');
const { makeKernel, makeDevKernel } = require('../utilities/kernel');
const { activate, measure } = require('../activation/sigmoid');
const zeros2D = require('../utilities/zeros-2d');

function predict(inputs) {
  return 1 / (1 + Math.exp(-inputs[this.thread.y][this.thread.x]));
}

function compare(weights, deltas) {
  const weight = weights[this.thread.y][this.thread.x];
  const delta = deltas[this.thread.y][this.thread.x];
  return weight * (1 - weight) * delta;
}

class Sigmoid extends Activation {
  constructor(inputLayer, settings) {
    super();
    this.inputLayer = inputLayer;

    const { width, height } = inputLayer;
    this.width = width;
    this.height = height;
    this.validate();
    this.weights = zeros2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
    this.setupPraxis(settings);
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

function sigmoid(inputLayer, settings) {
  return new Sigmoid(inputLayer, settings);
}

module.exports = { Sigmoid, sigmoid, predict, compare };
