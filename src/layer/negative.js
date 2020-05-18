const { makeKernel } = require('../utilities/kernel');
const { Modifier } = require('./types');

function predict(weights) {
  return -weights[this.thread.y][this.thread.x];
}

class Negative extends Modifier {
  constructor(settings, inputLayer) {
    super(settings);
    this.inputLayer = inputLayer;
    this.validate();
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
    });
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights);
  }
}

function negative(settings, inputLayer) {
  return new Negative(settings, inputLayer);
}

module.exports = { Negative, negative, predict };
