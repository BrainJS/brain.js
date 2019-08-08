const { makeKernel } = require('../utilities/kernel');
const zeros2D = require('../utilities/zeros-2d');
const { Operator } = require('./types');

function predict(inputWeights1, inputWeights2) {
  return inputWeights1[this.thread.y][this.thread.x] + inputWeights2[this.thread.y][this.thread.x];
}

class Add extends Operator {
  constructor(inputLayer1, inputLayer2, settings) {
    super();
    this.inputLayer1 = inputLayer1;
    this.inputLayer2 = inputLayer2;
    this.width = this.inputLayer1.width;
    this.height = this.inputLayer1.height;
    this.validate();
    this.weights = zeros2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
    this.setupPraxis(settings);
  }

  validate() {
    super.validate();
    if (this.inputLayer1.width !== this.inputLayer2.width) {
      throw new Error(
        `Layer width mismatch of ${this.inputLayer1.width} and ${
          this.inputLayer2.width
        }`
      );
    }

    if (this.inputLayer1.height !== this.inputLayer2.height) {
      throw new Error(
        `Layer height mismatch of ${this.inputLayer1.height} and ${
          this.inputLayer2.height
        }`
      );
    }
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
    });
  }

  predict() {
    this.weights = this.predictKernel(
      this.inputLayer1.weights,
      this.inputLayer2.weights
    );
  }

  // eslint-disable-next-line
  compare() {
    this.inputLayer1.deltas = this.deltas;
    this.inputLayer2.deltas = this.deltas;
  }
}

function add(inputLayer1, inputLayer2, settings) {
  return new Add(inputLayer1, inputLayer2, settings);
}

module.exports = { Add, add, predict };
