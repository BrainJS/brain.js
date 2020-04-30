const { Activation } = require('./activation');
const { makeKernel } = require('../utilities/kernel');
const { activate, measure } = require('../activation/tanh');
const { release, clear } = require('../utilities/kernel');

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

function tanh(inputLayer, settings) {
  return new Tanh(inputLayer, settings);
}

module.exports = { Tanh, tanh, predict2D, predict3D, compare2D, compare3D };
