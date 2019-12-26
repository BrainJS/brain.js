const { Modifier } = require('./types');
const { makeKernel, release } = require('../utilities/kernel');

function predict(array) {
  return array[this.thread.x][this.thread.y];
}

const compare = predict;

class Transpose extends Modifier {
  constructor(inputLayer) {
    super();
    this.inputLayer = inputLayer;
    this.width = this.inputLayer.height;
    this.height = this.inputLayer.width;
    this.validate();
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.height, this.width],
    });
    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height],
    });
  }

  predict() {
    const { weights } = this;
    release(this.weights);
    this.weights = this.predictKernel(this.inputLayer.weights);
  }

  compare() {
    release(this.inputLayer.deltas);
    // TODO: needs switched to this.compareKernel?
    this.inputLayer.deltas = this.predictKernel(this.deltas);
  }
}

function transpose(inputLayer) {
  return new Transpose(inputLayer);
}

module.exports = {
  Transpose,
  transpose,
};
