const { makeKernel, release, clear } = require('../utilities/kernel');
const { Operator } = require('./types');
const zeros2D = require('../utilities/zeros-2d');
const { checkSameSize } = require('../utilities/layer-size');

function predict(inputLayerWeights1, inputLayerWeights2) {
  return (
    inputLayerWeights1[this.thread.y][this.thread.x] *
    inputLayerWeights2[this.thread.y][this.thread.x]
  );
}

function compare(weights, deltas) {
  return (
    weights[this.thread.y][this.thread.x] * deltas[this.thread.y][this.thread.x]
  );
}

class MultiplyElement extends Operator {
  constructor(inputLayer1, inputLayer2) {
    super();
    this.inputLayer1 = inputLayer1;
    this.inputLayer2 = inputLayer2;

    this.width = inputLayer1.width;
    this.height = inputLayer1.height;
    this.validate();
    this.weights = zeros2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
  }

  validate() {
    super.validate();
    checkSameSize(this.inputLayer1, this.inputLayer2);
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      immutable: true,
    });

    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height],
      immutable: true,
    });
  }

  predict() {
    release(this.weights);
    this.weights = this.predictKernel(
      this.inputLayer1.weights,
      this.inputLayer2.weights
    );
    clear(this.deltas);
  }

  compare() {
    release(this.inputLayer1.deltas);
    release(this.inputLayer2.deltas);
    this.inputLayer1.deltas = this.compareKernel(
      this.inputLayer2.weights,
      this.deltas
    );
    this.inputLayer2.deltas = this.compareKernel(
      this.inputLayer1.weights,
      this.deltas
    );
  }
}

function multiplyElement(inputLayer1, inputLayer2) {
  return new MultiplyElement(inputLayer1, inputLayer2);
}

module.exports = { MultiplyElement, multiplyElement, predict, compare };
