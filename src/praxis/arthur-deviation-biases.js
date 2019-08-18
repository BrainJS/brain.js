const { makeKernel } = require('../utilities/kernel');
const { Base } = require('./base');

function update(weights, deltas) {
  return weights[this.thread.y][this.thread.x] + this.constants.learningRate * deltas[this.thread.y][this.thread.x];
}

class ArthurDeviationBiases extends Base {
  static get defaults() {
    return {
      learningRate: 0.3
    };
  }

  constructor(layer, settings) {
    super(layer, settings);
    this.kernel = null;
    this.setupKernels();
  }

  run(layer, previousLayer, nextLayer, learningRate) {
    const output = this.kernel(layer.weights, layer.deltas);
    return output;
  }

  setupKernels() {
    this.kernel = makeKernel(update, {
      output: [this.width, this.height],
      constants: {
        learningRate: this.learningRate
      }
    });
  }
}

function arthurDeviationBiases(layer, settings) {
  return new ArthurDeviationBiases(layer, settings);
}

module.exports = {
  ArthurDeviationBiases,
  arthurDeviationBiases,
  update,
};
