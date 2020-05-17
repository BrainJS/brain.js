const { Activation } = require('./types');
const { makeKernel, release, clear } = require('../utilities/kernel');
const { activate, measure } = require('../activation/sigmoid');

function predict2D(inputs) {
  return 1 / (1 + Math.exp(-inputs[this.thread.y][this.thread.x]));
}

function predict3D(inputs) {
  return (
    1 / (1 + Math.exp(-inputs[this.thread.z][this.thread.y][this.thread.x]))
  );
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
        immutable: true,
      });

      this.compareKernel = makeKernel(compare3D, {
        output: [this.width, this.height, this.depth],
        functions: [measure],
        immutable: true,
      });
    } else {
      this.predictKernel = makeKernel(predict2D, {
        output: [this.width, this.height],
        functions: [activate],
        immutable: true,
      });

      this.compareKernel = makeKernel(compare2D, {
        output: [this.width, this.height],
        functions: [measure],
        immutable: true,
      });
    }
  }

  predict() {
    release(this.weights);
    this.weights = this.predictKernel(this.inputLayer.weights);
    clear(this.deltas);
  }

  compare() {
    release(this.inputLayer.deltas);
    this.inputLayer.deltas = this.compareKernel(this.weights, this.deltas);
  }
}

function sigmoid(inputLayer, settings) {
  return new Sigmoid(inputLayer, settings);
}

module.exports = {
  Sigmoid,
  sigmoid,
  predict2D,
  predict3D,
  compare2D,
  compare3D,
};
