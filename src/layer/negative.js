const makeKernel = require('../utilities/kernel').makeKernel;
const Modifier = require('./types').Modifier;

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

module.exports = Negative;
