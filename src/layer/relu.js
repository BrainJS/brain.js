const { Activation } = require('./types');
const { makeKernel, release } = require('../utilities/kernel');
const { activate, measure } = require('../activation/relu');

function predict2D(inputs) {
  return activate(inputs[this.thread.y][this.thread.x]);
}

function compare2D(weights, deltas) {
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
  setupKernels() {
    const { width, height, depth } = this.inputLayer;
    if (depth > 0) {
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
    release(this.inputLayer.deltas);
    this.inputLayer.deltas = this.compareKernel(this.weights, this.deltas);
  }
}

function relu(inputLayer, settings) {
  return new Relu(inputLayer, settings);
}

module.exports = { Relu, relu, predict2D, compare2D, predict3D, compare3D };
