const { makeKernel, release, clone } = require('../utilities/kernel');
const zeros2D = require('../utilities/zeros-2d');
const { checkSameSize } = require('../utilities/layer-size');
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
    checkSameSize(this.inputLayer1, this.inputLayer2);
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
    });
  }

  predict() {
    release(this.weights);
    this.weights = this.predictKernel(
      this.inputLayer1.weights,
      this.inputLayer2.weights
    );
  }

  compare() {
    release(this.inputLayer1.deltas);
    release(this.inputLayer2.deltas);
    this.inputLayer1.deltas = clone(this.deltas);
    this.inputLayer2.deltas = clone(this.deltas);
  }
}

function add(inputLayer1, inputLayer2, settings) {
  return new Add(inputLayer1, inputLayer2, settings);
}

module.exports = { Add, add, predict };
