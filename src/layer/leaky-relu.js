const { Activation } = require('./types');
const { makeKernel, release } = require('../utilities/kernel');
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
  setupKernels() {
    const { width, height, depth } = this.inputLayer;
    if (this.depth > 0) {
      this.predictKernel = makeKernel(predict3D, {
        output: [width, height, depth],
        functions: [activate],
      });

      this.compareKernel = makeKernel(compare3D, {
        output: [width, height, depth],
        functions: [measure],
      });
    } else {
      this.predictKernel = makeKernel(predict2D, {
        output: [width, height],
        functions: [activate],
      });

      this.compareKernel = makeKernel(compare2D, {
        output: [width, height],
        functions: [measure],
      });
    }
  }

  predict() {
    release(this.weights);
    this.weights = this.predictKernel(this.inputLayer.weights);
  }

  compare() {
    const { deltas } = this;
    this.deltas = this.compareKernel(this.weights, deltas);
    release(deltas);
  }
}

function leakyRelu(inputLayer, settings) {
  return new LeakyRelu(inputLayer, settings);
}

module.exports = { LeakyRelu, leakyRelu, predict2D, predict3D, compare2D, compare3D };
