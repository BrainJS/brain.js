const { Activation } = require('./types');
const { makeKernel } = require('../utilities/kernel');
const { activate, measure } = require('../activation/sigmoid');

function predict2D(inputs) {
  return 1 / (1 + Math.exp(-inputs[this.thread.y][this.thread.x]));
}

function predict3D(inputs) {
  return 1 / (1 + Math.exp(-inputs[this.thread.z][this.thread.y][this.thread.x]));
}

function compare2D(weights, deltas) {
  const weight = weights[this.thread.y][this.thread.x];
  const delta = deltas[this.thread.y][this.thread.x];
  return weight * (1 - weight) * delta;
}

function compare3D(weights, deltas) {
  const weight = weights[this.thread.z][this.thread.y][this.thread.x];
  const delta = deltas[this.thread.z][this.thread.y][this.thread.x];
  return weight * (1 - weight) * delta;
}

class Sigmoid extends Activation {
  setupKernels() {
    if (this.depth > 0) {
      this.predictKernel = makeKernel(predict3D, {
        output: [this.width, this.height, this.depth],
        functions: [activate],
      });

      this.compareKernel = makeKernel(compare3D, {
        output: [this.width, this.height, this.depth],
        functions: [measure],
      });
    } else {
      this.predictKernel = makeKernel(predict2D, {
        output: [this.width, this.height],
        functions: [activate],
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
    this.inputLayer.deltas = this.compareKernel(this.weights, this.deltas);
  }
}

function sigmoid(inputLayer, settings) {
  return new Sigmoid(inputLayer, settings);
}

module.exports = { Sigmoid, sigmoid, predict2D, predict3D, compare2D, compare3D };
